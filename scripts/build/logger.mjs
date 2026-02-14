import { appendFile, mkdir, writeFile } from 'node:fs/promises'
import { isAbsolute, resolve } from 'node:path'
import { createConsola } from 'consola'
import { logsDir, rootDir } from './constants.mjs'

const consola = createConsola({
  level: process.env.FALCON_BUILD_LOG_LEVEL ?? 'info'
})

const stageDurations = new Map()

let buildStartedAt = 0
let buildLogFile = ''
let latestLogFile = ''
let initPromise = null
let initialized = false
let writeQueue = Promise.resolve()

const resolveLogDir = () => {
  const rawValue = process.env.FALCON_BUILD_LOG_DIR

  if (!rawValue) {
    return logsDir
  }

  return isAbsolute(rawValue) ? rawValue : resolve(rootDir, rawValue)
}

const formatStamp = (date) => {
  const pad = (value) => `${value}`.padStart(2, '0')

  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(
    date.getHours()
  )}${pad(date.getMinutes())}${pad(date.getSeconds())}`
}

const formatContext = ({ stage, entry }) => {
  const chunks = []

  if (stage) {
    chunks.push(`stage:${stage}`)
  }

  if (entry) {
    chunks.push(`entry:${entry}`)
  }

  if (chunks.length === 0) {
    return ''
  }

  return ` [${chunks.join('][')}]`
}

const formatLine = (level, message, context) =>
  `[${new Date().toISOString()}] [${level.toUpperCase()}]${formatContext(context)} ${message}\n`

const queueWrite = (line) => {
  writeQueue = writeQueue
    .then(async () => {
      await appendFile(buildLogFile, line, 'utf8')
      await appendFile(latestLogFile, line, 'utf8')
    })
    .catch((error) => {
      consola.warn(`failed to write build logs: ${error.message}`)
    })

  return writeQueue
}

const ensureInitialized = async () => {
  if (initialized) {
    return
  }

  if (initPromise) {
    await initPromise
    return
  }

  initPromise = (async () => {
    const logDir = resolveLogDir()
    const now = new Date()

    buildStartedAt = now.getTime()
    buildLogFile = resolve(logDir, `build-${formatStamp(now)}.log`)
    latestLogFile = resolve(logDir, 'build-latest.log')

    await mkdir(logDir, { recursive: true })
    await writeFile(buildLogFile, '', 'utf8')
    await writeFile(latestLogFile, '', 'utf8')

    initialized = true
  })()

  await initPromise.finally(() => {
    initPromise = null
  })
}

const writeLog = async (level, message, context = {}) => {
  await ensureInitialized()

  const formattedContext = formatContext(context)
  const consoleMessage = `${formattedContext} ${message}`.trim()

  switch (level) {
    case 'success':
      consola.success(consoleMessage)
      break
    case 'start':
      consola.start(consoleMessage)
      break
    case 'warn':
      consola.warn(consoleMessage)
      break
    case 'error':
      consola.error(consoleMessage)
      break
    default:
      consola.info(consoleMessage)
      break
  }

  await queueWrite(formatLine(level, message, context))
}

const normalizeError = (error) => {
  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

const stageHints = {
  clean: 'check dist folder permissions and file locks.',
  js: 'check entryPoints, Vue SFC syntax, and bundler externals.',
  types: 'check tsconfig.build.json and vue-tsc type errors.',
  style: 'check SCSS source paths and Sass compile errors.',
  meta: 'check source package.json and dist write permissions.'
}

const initBuildLogger = async () => {
  await ensureInitialized()
  await writeLog('info', `rootDir: ${rootDir}`, { stage: 'bootstrap' })
  await writeLog('info', `logFile: ${buildLogFile}`, { stage: 'bootstrap' })
}

const withStage = async (stage, task) => {
  const startedAt = Date.now()
  await writeLog('start', 'started', { stage })

  try {
    const result = await task()
    const duration = Date.now() - startedAt
    stageDurations.set(stage, duration)
    await writeLog('success', `completed in ${duration}ms`, { stage })
    return result
  } catch (error) {
    const duration = Date.now() - startedAt
    const detail = normalizeError(error)
    await writeLog('error', `failed in ${duration}ms: ${detail}`, { stage })
    await writeLog('warn', `hint: ${stageHints[stage] ?? 'check stage inputs and paths.'}`, {
      stage
    })
    throw error
  }
}

const withEntry = async (stage, entry, task) => {
  const startedAt = Date.now()
  await writeLog('start', 'started', { stage, entry })

  try {
    const result = await task()
    const duration = Date.now() - startedAt
    await writeLog('success', `completed in ${duration}ms`, { stage, entry })
    return result
  } catch (error) {
    const duration = Date.now() - startedAt
    const detail = normalizeError(error)
    await writeLog('error', `failed in ${duration}ms: ${detail}`, { stage, entry })
    await writeLog('warn', 'hint: check the entry source file and generated output path.', {
      stage,
      entry
    })
    throw error
  }
}

const logInfo = async (message, context = {}) => writeLog('info', message, context)
const logWarn = async (message, context = {}) => writeLog('warn', message, context)
const logError = async (message, context = {}) => writeLog('error', message, context)

const logSummary = async () => {
  const totalDuration = Date.now() - buildStartedAt
  const summary = [...stageDurations.entries()]
    .map(([stage, duration]) => `${stage}=${duration}ms`)
    .join(', ')

  await writeLog('info', `stage durations: ${summary || 'n/a'}`, { stage: 'summary' })
  await writeLog('success', `build total duration: ${totalDuration}ms`, { stage: 'summary' })
}

const flushBuildLogs = async () => {
  await writeQueue
}

export {
  flushBuildLogs,
  initBuildLogger,
  logError,
  logInfo,
  logSummary,
  logWarn,
  withEntry,
  withStage
}
