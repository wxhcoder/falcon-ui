import { spawn } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { gzip } from 'node:zlib'
import { promisify } from 'node:util'
import { format, resolveConfig } from 'prettier'

const gzipAsync = promisify(gzip)
const rootDir = path.resolve(import.meta.dirname, '../..')
const outputDir = process.env.FL_TABLE_ARTIFACT_DIR
  ? path.resolve(rootDir, process.env.FL_TABLE_ARTIFACT_DIR)
  : path.join(rootDir, 'docs/performance/artifacts')
const prettierOptions = (await resolveConfig(path.join(outputDir, 'diagnostic.json'))) ?? {}
const formatJson = (value) => format(JSON.stringify(value), { ...prettierOptions, parser: 'json' })
const playOrigin = process.env.FL_TABLE_PLAY_ORIGIN ?? 'http://127.0.0.1:5174'
const chromeExecutable =
  process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

const scenarios = [
  { slug: 'plain-cross-off', mode: 'plain', cross: false },
  { slug: 'plain-cross-on', mode: 'plain', cross: true },
  { slug: 'editor-cross-off', mode: 'editor', cross: false },
  { slug: 'editor-cross-on', mode: 'editor', cross: true }
]

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

const waitForFile = async (filePath, timeoutMs = 30_000) => {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      return await readFile(filePath, 'utf8')
    } catch (error) {
      if (error?.code !== 'ENOENT') {
        throw error
      }
      await delay(100)
    }
  }
  throw new Error(`Timed out waiting for ${filePath}`)
}

const waitForJson = async (url, timeoutMs = 30_000) => {
  const deadline = Date.now() + timeoutMs
  let lastError
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        return await response.json()
      }
      lastError = new Error(`${response.status} ${response.statusText}`)
    } catch (error) {
      lastError = error
    }
    await delay(100)
  }
  throw new Error(`Timed out fetching ${url}: ${lastError?.message ?? 'unknown error'}`)
}

const createCdpClient = async (webSocketUrl) => {
  const socket = new WebSocket(webSocketUrl)
  const pending = new Map()
  const eventWaiters = new Map()
  let nextId = 1

  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })

  socket.addEventListener('message', (message) => {
    const data = JSON.parse(String(message.data))
    if (typeof data.id === 'number') {
      const request = pending.get(data.id)
      if (!request) {
        return
      }
      pending.delete(data.id)
      if (data.error) {
        request.reject(new Error(`${request.method}: ${data.error.message}`))
      } else {
        request.resolve(data.result)
      }
      return
    }

    const waiters = eventWaiters.get(data.method)
    if (!waiters || waiters.length === 0) {
      return
    }
    eventWaiters.delete(data.method)
    for (const waiter of waiters) {
      clearTimeout(waiter.timeoutId)
      waiter.resolve(data.params)
    }
  })

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = nextId
      nextId += 1
      pending.set(id, { method, resolve, reject })
      socket.send(JSON.stringify({ id, method, params }))
    })

  const waitForEvent = (method, timeoutMs = 30_000) =>
    new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        const waiters = eventWaiters.get(method) ?? []
        eventWaiters.set(
          method,
          waiters.filter((waiter) => waiter.resolve !== resolve)
        )
        reject(new Error(`Timed out waiting for CDP event ${method}`))
      }, timeoutMs)
      const waiters = eventWaiters.get(method) ?? []
      waiters.push({ resolve, timeoutId })
      eventWaiters.set(method, waiters)
    })

  const close = () => socket.close()

  return { close, send, waitForEvent }
}

const evaluate = async (client, expression) => {
  const result = await client.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true
  })
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text ?? 'Runtime evaluation failed')
  }
  return result.result?.value
}

const waitForBenchmark = (client, expectedEditors) =>
  evaluate(
    client,
    `(async () => {
      for (let attempt = 0; attempt < 7200; attempt += 1) {
        const snapshot = window.__flTablePerformance?.getSnapshot?.()
        if (
          snapshot?.dom?.rows === 50 &&
          snapshot?.dom?.columns === 50 &&
          snapshot?.dom?.bodyCells === 2500 &&
          snapshot?.dom?.editors === ${expectedEditors}
        ) {
          return snapshot
        }
        await new Promise((resolve) => requestAnimationFrame(resolve))
      }
      throw new Error('Benchmark readiness timeout')
    })()`
  )

const activateFirstCell = (client) =>
  evaluate(
    client,
    `(async () => {
      const cell = document.querySelector(
        '[data-testid="benchmark-grid"] .el-table__body-wrapper tbody tr:first-child td.el-table__cell:first-child'
      )
      if (!(cell instanceof HTMLElement)) {
        throw new Error('First benchmark cell not found')
      }
      cell.click()
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
      window.__flTablePerformance?.reset?.()
      return window.__flTablePerformance?.getSnapshot?.()
    })()`
  )

const dispatchArrowKey = async (client, key) => {
  const keyCode = key === 'ArrowRight' ? 39 : key === 'ArrowDown' ? 40 : 37
  await client.send('Input.dispatchKeyEvent', {
    type: 'keyDown',
    key,
    code: key,
    windowsVirtualKeyCode: keyCode,
    nativeVirtualKeyCode: keyCode
  })
  await client.send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key,
    code: key,
    windowsVirtualKeyCode: keyCode,
    nativeVirtualKeyCode: keyCode
  })
}

const waitForSampleCount = (client, expectedCount) =>
  evaluate(
    client,
    `(async () => {
      for (let attempt = 0; attempt < 600; attempt += 1) {
        const snapshot = window.__flTablePerformance?.getSnapshot?.()
        if ((snapshot?.summary?.count ?? 0) >= ${expectedCount}) {
          return snapshot
        }
        await new Promise((resolve) => requestAnimationFrame(resolve))
      }
      throw new Error('Timed out waiting for ${expectedCount} samples')
    })()`
  )

const readTraceStream = async (client, streamHandle) => {
  const chunks = []
  let isEof = false
  while (!isEof) {
    const result = await client.send('IO.read', { handle: streamHandle })
    chunks.push(
      result.base64Encoded ? Buffer.from(result.data, 'base64') : Buffer.from(result.data)
    )
    isEof = result.eof === true
  }
  await client.send('IO.close', { handle: streamHandle })
  return Buffer.concat(chunks)
}

const captureScenario = async (client, scenario) => {
  const url =
    `${playOrigin}/table-performance?rows=50&cols=50&mode=${scenario.mode}` +
    `&cross=${scenario.cross ? '1' : '0'}&drag=0`
  await client.send('Page.navigate', { url })
  const expectedEditors = scenario.mode === 'editor' ? 2500 : 0
  await waitForBenchmark(client, expectedEditors)
  await activateFirstCell(client)

  await dispatchArrowKey(client, 'ArrowRight')
  await waitForSampleCount(client, 1)
  await dispatchArrowKey(client, 'ArrowLeft')
  await waitForSampleCount(client, 2)
  await evaluate(client, 'window.__flTablePerformance?.reset?.()')

  await client.send('Tracing.start', {
    transferMode: 'ReturnAsStream',
    traceConfig: {
      recordMode: 'recordUntilFull',
      includedCategories: [
        'blink.user_timing',
        'devtools.timeline',
        'disabled-by-default-devtools.timeline',
        'disabled-by-default-devtools.timeline.frame',
        'disabled-by-default-v8.cpu_profiler',
        'disabled-by-default-v8.cpu_profiler.hires',
        'latencyInfo',
        'v8.execute'
      ]
    }
  })

  let expectedCount = 0
  for (const key of [...Array(12).fill('ArrowRight'), ...Array(12).fill('ArrowDown')]) {
    expectedCount += 1
    await dispatchArrowKey(client, key)
    await waitForSampleCount(client, expectedCount)
  }

  const metrics = await evaluate(client, 'window.__flTablePerformance?.getSnapshot?.()')
  const tracingComplete = client.waitForEvent('Tracing.tracingComplete', 120_000)
  await client.send('Tracing.end')
  const { stream } = await tracingComplete
  const rawTrace = await readTraceStream(client, stream)
  const compressedTrace = await gzipAsync(rawTrace, { level: 9 })

  const screenshot = await client.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
    fromSurface: true
  })

  const metricsJson = await formatJson(metrics)
  await Promise.all([
    writeFile(path.join(outputDir, `${scenario.slug}.trace.json.gz`), compressedTrace),
    writeFile(path.join(outputDir, `${scenario.slug}.metrics.json`), metricsJson),
    writeFile(path.join(outputDir, `${scenario.slug}.png`), Buffer.from(screenshot.data, 'base64'))
  ])

  return {
    scenario: scenario.slug,
    traceBytes: compressedTrace.byteLength,
    screenshotBytes: Buffer.byteLength(screenshot.data, 'base64'),
    metrics
  }
}

const main = async () => {
  await mkdir(outputDir, { recursive: true })
  const profileDir = await mkdtemp(path.join(tmpdir(), 'falcon-ui-table-trace-'))
  const activePortFile = path.join(profileDir, 'DevToolsActivePort')
  const chrome = spawn(
    chromeExecutable,
    [
      '--headless=new',
      '--disable-background-networking',
      '--disable-component-update',
      '--disable-default-apps',
      '--disable-extensions',
      '--disable-sync',
      '--metrics-recording-only',
      '--no-first-run',
      '--remote-debugging-port=0',
      `--user-data-dir=${profileDir}`,
      '--window-size=1440,900',
      'about:blank'
    ],
    { stdio: 'ignore', windowsHide: true }
  )

  let client
  try {
    const [portLine] = (await waitForFile(activePortFile)).trim().split(/\r?\n/)
    const port = Number.parseInt(portLine, 10)
    const targets = await waitForJson(`http://127.0.0.1:${port}/json/list`)
    const pageTarget = targets.find((target) => target.type === 'page')
    if (!pageTarget?.webSocketDebuggerUrl) {
      throw new Error('Chrome did not expose a debuggable page target')
    }

    client = await createCdpClient(pageTarget.webSocketDebuggerUrl)
    await client.send('Page.enable')
    await client.send('Runtime.enable')
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    })
    await client.send('Emulation.setCPUThrottlingRate', { rate: 1 })

    const results = []
    for (const scenario of scenarios) {
      results.push(await captureScenario(client, scenario))
      process.stdout.write(
        `${JSON.stringify({
          scenario: results.at(-1).scenario,
          traceBytes: results.at(-1).traceBytes,
          summary: results.at(-1).metrics.summary
        })}\n`
      )
    }
    await writeFile(path.join(outputDir, 'capture-summary.json'), await formatJson(results))
  } finally {
    client?.close()
    chrome.kill()
    await new Promise((resolve) => chrome.once('exit', resolve))
    const resolvedProfile = path.resolve(profileDir)
    const resolvedTemp = `${path.resolve(tmpdir())}${path.sep}`
    if (resolvedProfile.startsWith(resolvedTemp)) {
      await rm(resolvedProfile, { recursive: true, force: true })
    }
  }
}

await main()
