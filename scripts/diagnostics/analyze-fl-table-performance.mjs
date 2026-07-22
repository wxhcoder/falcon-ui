import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import zlib from 'node:zlib'
import { format, resolveConfig } from 'prettier'

const workspaceRoot = process.cwd()
const artifactDirectory = process.env.FL_TABLE_ARTIFACT_DIR
  ? path.resolve(workspaceRoot, process.env.FL_TABLE_ARTIFACT_DIR)
  : path.join(workspaceRoot, 'docs', 'performance', 'artifacts')
const prettierOptions = (await resolveConfig(path.join(artifactDirectory, 'diagnostic.json'))) ?? {}
const scenarios = ['plain-cross-off', 'plain-cross-on', 'editor-cross-off', 'editor-cross-on']

const phaseByEventName = new Map([
  ['EventDispatch', 'scripting'],
  ['EvaluateScript', 'scripting'],
  ['FireAnimationFrame', 'scripting'],
  ['FunctionCall', 'scripting'],
  ['RunMicrotasks', 'scripting'],
  ['TimerFire', 'scripting'],
  ['Commit', 'rendering'],
  ['HitTest', 'rendering'],
  ['Layerize', 'rendering'],
  ['Layout', 'rendering'],
  ['PrePaint', 'rendering'],
  ['UpdateLayoutTree', 'rendering'],
  ['Paint', 'painting']
])

const phasePriority = ['painting', 'rendering', 'gc', 'scripting']

function round(value, digits = 1) {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

function mergeIntervals(intervals) {
  const sorted = intervals
    .filter((interval) => interval.end > interval.start)
    .sort((left, right) => left.start - right.start || right.end - left.end)

  const merged = []
  for (const interval of sorted) {
    const previous = merged.at(-1)
    if (!previous || interval.start > previous.end) {
      merged.push({ ...interval })
      continue
    }
    previous.end = Math.max(previous.end, interval.end)
  }
  return merged
}

function sumIntervals(intervals) {
  return mergeIntervals(intervals).reduce(
    (total, interval) => total + interval.end - interval.start,
    0
  )
}

function eventIntervals(events) {
  return events.map((event) => ({ start: event.ts, end: event.ts + event.dur }))
}

function summarizeDurations(durations) {
  if (durations.length === 0) return { count: 0, totalMs: 0, maxMs: 0 }
  return {
    count: durations.length,
    totalMs: round(durations.reduce((total, duration) => total + duration, 0) / 1000),
    maxMs: round(Math.max(...durations) / 1000)
  }
}

function classifyMainThreadTime(events, busyMicroseconds) {
  const boundaries = []
  for (const event of events) {
    if (!event.dur) continue
    let phase = phaseByEventName.get(event.name)
    if (!phase && (event.name === 'MinorGC' || event.name === 'MajorGC')) phase = 'gc'
    if (!phase) continue
    boundaries.push({ time: event.ts, phase, delta: 1 })
    boundaries.push({ time: event.ts + event.dur, phase, delta: -1 })
  }

  boundaries.sort((left, right) => left.time - right.time || left.delta - right.delta)
  const active = new Map(phasePriority.map((phase) => [phase, 0]))
  const totals = new Map(phasePriority.map((phase) => [phase, 0]))
  let previousTime = boundaries[0]?.time ?? 0

  for (let index = 0; index < boundaries.length; ) {
    const time = boundaries[index].time
    const activePhase = phasePriority.find((phase) => active.get(phase) > 0)
    if (activePhase) totals.set(activePhase, totals.get(activePhase) + time - previousTime)

    while (index < boundaries.length && boundaries[index].time === time) {
      const boundary = boundaries[index]
      active.set(boundary.phase, active.get(boundary.phase) + boundary.delta)
      index += 1
    }
    previousTime = time
  }

  const classified = [...totals.values()].reduce((total, value) => total + value, 0)
  totals.set('other', Math.max(0, busyMicroseconds - classified))

  return Object.fromEntries(
    [...totals.entries()].map(([phase, duration]) => [
      phase,
      {
        durationMs: round(duration / 1000),
        percentOfBusy: busyMicroseconds ? round((duration / busyMicroseconds) * 100) : 0
      }
    ])
  )
}

function collectCpuHotspots(traceEvents, rendererPid) {
  const nodes = new Map()
  const chunks = traceEvents.filter(
    (event) => event.pid === rendererPid && event.name === 'ProfileChunk'
  )

  for (const chunk of chunks) {
    for (const node of chunk.args?.data?.cpuProfile?.nodes ?? []) nodes.set(node.id, node)
  }

  const selfSamples = new Map()
  const inclusiveSamples = new Map()
  let totalSamples = 0

  for (const chunk of chunks) {
    for (const nodeId of chunk.args?.data?.cpuProfile?.samples ?? []) {
      totalSamples += 1
      selfSamples.set(nodeId, (selfSamples.get(nodeId) ?? 0) + 1)

      const visited = new Set()
      let currentNodeId = nodeId
      while (currentNodeId && !visited.has(currentNodeId)) {
        visited.add(currentNodeId)
        inclusiveSamples.set(currentNodeId, (inclusiveSamples.get(currentNodeId) ?? 0) + 1)
        currentNodeId = nodes.get(currentNodeId)?.parent
      }
    }
  }

  const describe = ([nodeId, samples]) => {
    const frame = nodes.get(nodeId)?.callFrame ?? {}
    return {
      functionName: frame.functionName || '(anonymous)',
      url: frame.url || '',
      line: (frame.lineNumber ?? -1) + 1,
      samples,
      percent: totalSamples ? round((samples / totalSamples) * 100) : 0
    }
  }

  const isFalconFrame = ([nodeId]) => {
    const frame = nodes.get(nodeId)?.callFrame
    return frame?.url?.includes('/dist/falcon-ui/') || frame?.functionName === 'scrollIntoView'
  }

  const sortAndDescribe = (entries) =>
    entries
      .filter(isFalconFrame)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 15)
      .map(describe)

  return {
    totalSamples,
    self: sortAndDescribe([...selfSamples.entries()]),
    inclusive: sortAndDescribe([...inclusiveSamples.entries()])
  }
}

function analyzeScenario(scenario) {
  const metricsPath = path.join(artifactDirectory, `${scenario}.metrics.json`)
  const tracePath = path.join(artifactDirectory, `${scenario}.trace.json.gz`)
  const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'))
  const trace = JSON.parse(zlib.gunzipSync(fs.readFileSync(tracePath)))
  const mainThread = trace.traceEvents.find(
    (event) =>
      event.ph === 'M' && event.name === 'thread_name' && event.args?.name === 'CrRendererMain'
  )

  if (!mainThread) throw new Error(`CrRendererMain metadata missing from ${tracePath}`)

  const completeMainEvents = trace.traceEvents.filter(
    (event) =>
      event.pid === mainThread.pid &&
      event.tid === mainThread.tid &&
      event.ph === 'X' &&
      Number.isFinite(event.dur)
  )
  const runTasks = completeMainEvents.filter((event) => event.name === 'RunTask')
  const mergedRunTasks = mergeIntervals(eventIntervals(runTasks))
  const busyMicroseconds = mergedRunTasks.reduce(
    (total, interval) => total + interval.end - interval.start,
    0
  )
  const longTasks = mergedRunTasks
    .map((interval) => interval.end - interval.start)
    .filter((duration) => duration >= 50_000)
  const keydownEvents = completeMainEvents.filter(
    (event) => event.name === 'EventDispatch' && event.args?.data?.type === 'keydown'
  )
  const keydownIntervals = mergeIntervals(eventIntervals(keydownEvents))

  const eventBreakdown = {}
  for (const eventName of [
    'EventDispatch',
    'RunMicrotasks',
    'UpdateLayoutTree',
    'Layout',
    'PrePaint',
    'Layerize',
    'Paint',
    'MinorGC',
    'MajorGC'
  ]) {
    const matches = completeMainEvents.filter((event) => event.name === eventName)
    eventBreakdown[eventName] = {
      ...summarizeDurations(matches.map((event) => event.dur)),
      unionMs: round(sumIntervals(eventIntervals(matches)) / 1000)
    }
  }

  return {
    scenario,
    settings: metrics.settings,
    dom: metrics.dom,
    pageMetrics: metrics.summary,
    callbackProbe: {
      bodyPerKey: [...new Set(metrics.samples.map((sample) => sample.cellClassCalls))],
      headerPerKey: [...new Set(metrics.samples.map((sample) => sample.headerClassCalls))]
    },
    trace: {
      rendererPid: mainThread.pid,
      rendererTid: mainThread.tid,
      mainThreadBusyMs: round(busyMicroseconds / 1000),
      longTasks: summarizeDurations(longTasks),
      keydownDispatch: summarizeDurations(
        keydownIntervals.map((interval) => interval.end - interval.start)
      ),
      phases: classifyMainThreadTime(completeMainEvents, busyMicroseconds),
      eventBreakdown,
      droppedFrames: trace.traceEvents.filter((event) => event.name === 'DroppedFrame').length,
      cpuHotspots: collectCpuHotspots(trace.traceEvents, mainThread.pid)
    }
  }
}

const analysis = {
  generatedAt: new Date().toISOString(),
  methodology: {
    phaseTotals:
      'Exclusive main-thread time; nested painting/rendering/GC overrides enclosing scripting.',
    eventTotals: 'Named event totals can overlap; unionMs removes same-name nesting.',
    cpuHotspots: 'Sampling percentages, not wall-clock percentages.'
  },
  scenarios: scenarios.map(analyzeScenario)
}

const outputPath = path.join(artifactDirectory, 'trace-analysis.json')
fs.writeFileSync(
  outputPath,
  await format(JSON.stringify(analysis), { ...prettierOptions, parser: 'json' })
)
process.stdout.write(`${path.relative(workspaceRoot, outputPath)}\n`)
