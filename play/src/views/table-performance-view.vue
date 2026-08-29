<template>
  <section class="table-performance-page" data-testid="table-performance-page">
    <header class="table-performance-page__header">
      <div>
        <p class="table-performance-page__eyebrow">FlTable diagnostic</p>
        <h2 class="page-title">50 × 50 keyboard focus benchmark</h2>
        <p class="page-desc">
          Click a body cell, then use the arrow keys. Query parameters keep every browser trace
          reproducible.
        </p>
      </div>
      <button class="table-performance-page__reset" type="button" @click="resetMetrics">
        Reset metrics
      </button>
    </header>

    <form class="table-performance-controls" aria-label="Benchmark configuration" @submit.prevent>
      <label>
        <span>Rows</span>
        <input
          data-testid="rows-control"
          type="number"
          min="1"
          max="100"
          :value="settings.rows"
          @change="handleDimensionChange('rows', $event)" />
      </label>
      <label>
        <span>Columns</span>
        <input
          data-testid="columns-control"
          type="number"
          min="1"
          max="100"
          :value="settings.columns"
          @change="handleDimensionChange('cols', $event)" />
      </label>
      <label>
        <span>Cell mode</span>
        <select data-testid="mode-control" :value="settings.mode" @change="handleModeChange">
          <option value="plain">Plain text</option>
          <option value="editor">FlTableEditor + FlInput</option>
        </select>
      </label>
      <label class="table-performance-controls__check">
        <input
          data-testid="cross-control"
          type="checkbox"
          :checked="settings.isCrossHighlight"
          @change="handleBooleanChange('cross', $event)" />
        <span>Cross highlight</span>
      </label>
      <label class="table-performance-controls__check">
        <input
          data-testid="drag-control"
          type="checkbox"
          :checked="settings.isDragEnabled"
          @change="handleBooleanChange('drag', $event)" />
        <span>Row / column drag</span>
      </label>
    </form>

    <div class="table-performance-status" aria-live="polite">
      <div>
        <span>Scenario</span>
        <strong data-testid="scenario-label">{{ scenarioLabel }}</strong>
      </div>
      <div>
        <span>Expected body cells</span>
        <strong>{{ settings.rows * settings.columns }}</strong>
      </div>
      <div>
        <span>Sampling protocol</span>
        <strong>12 × Right, 12 × Down</strong>
      </div>
    </div>

    <article class="table-performance-metrics" data-testid="metrics-panel">
      <div>
        <h3>Live measurement</h3>
        <p>
          Duration is measured from captured keydown to the second animation frame. Probe counters
          are non-reactive and return no classes.
        </p>
      </div>
      <pre ref="metricsOutputRef" data-testid="metrics-output">Preparing benchmark…</pre>
    </article>

    <article ref="benchmarkHostRef" class="table-performance-grid" data-testid="benchmark-grid">
      <FlTable
        :key="renderKey"
        :data="benchmarkRows"
        :is-edit="settings.mode === 'editor'"
        :cross-highlight="settings.isCrossHighlight"
        :row-draggable="settings.isDragEnabled"
        :column-draggable="settings.isDragEnabled"
        :cell-class-name="probeCellClass"
        :header-cell-class-name="probeHeaderCellClass"
        row-key-field="id"
        height="520"
        style="width: 100%">
        <ElTableColumn
          v-for="column in benchmarkColumns"
          :key="column.key"
          :prop="column.key"
          :label="column.label"
          :width="128">
          <template #default="{ row }">
            <FlTableEditor
              v-if="settings.mode === 'editor'"
              class="table-performance-grid__editor"
              mode="text">
              <FlInput
                :model-value="readCell(row, column.key)"
                is-table
                @update:model-value="writeCell(row, column.key, $event)" />
            </FlTableEditor>
            <span v-else class="table-performance-grid__value">
              {{ readCell(row, column.key) }}
            </span>
          </template>
        </ElTableColumn>
      </FlTable>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElTableColumn } from 'element-plus'
import { FlInput, FlTable, FlTableEditor } from '@falcon-ui/falcon-ui'

type BenchmarkMode = 'plain' | 'editor'
type DirectionKey = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight'
type BenchmarkRow = Record<string, string | number>

type BenchmarkColumn = {
  key: string
  label: string
}

type BenchmarkSettings = {
  rows: number
  columns: number
  mode: BenchmarkMode
  isCrossHighlight: boolean
  isDragEnabled: boolean
}

type DomSnapshot = {
  rows: number
  columns: number
  bodyCells: number
  editors: number
  activeRow: number | null
  activeColumn: number | null
}

type KeySample = {
  sequence: number
  key: DirectionKey
  durationMs: number
  cellClassCalls: number
  headerClassCalls: number
  activeRow: number | null
  activeColumn: number | null
}

type PerformanceSnapshot = {
  settings: BenchmarkSettings
  dom: DomSnapshot
  samples: KeySample[]
  summary: ReturnType<typeof summarizeSamples>
}

declare global {
  interface Window {
    __flTablePerformance?: {
      getSnapshot: () => PerformanceSnapshot
      reset: () => void
    }
  }
}

const DEFAULT_SIZE = 50
const MAX_SIZE = 100
const route = useRoute()
const router = useRouter()
const benchmarkHostRef = shallowRef<HTMLElement | null>(null)
const metricsOutputRef = shallowRef<HTMLElement | null>(null)
const benchmarkRows = shallowRef<BenchmarkRow[]>([])
const benchmarkColumns = shallowRef<BenchmarkColumn[]>([])
const renderKey = ref(0)

let cellClassCalls = 0
let headerClassCalls = 0
let rebuildSequence = 0
let samples: KeySample[] = []
let latestDomSnapshot: DomSnapshot = createEmptyDomSnapshot()

const readQueryValue = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : undefined
  }

  return typeof value === 'string' ? value : undefined
}

const parseSize = (value: unknown) => {
  const parsed = Number.parseInt(readQueryValue(value) ?? '', 10)
  return Number.isInteger(parsed) ? Math.min(Math.max(parsed, 1), MAX_SIZE) : DEFAULT_SIZE
}

const settings = computed<BenchmarkSettings>(() => ({
  rows: parseSize(route.query.rows),
  columns: parseSize(route.query.cols),
  mode: readQueryValue(route.query.mode) === 'editor' ? 'editor' : 'plain',
  isCrossHighlight: readQueryValue(route.query.cross) === '1',
  isDragEnabled: readQueryValue(route.query.drag) === '1'
}))

const scenarioLabel = computed(
  () =>
    `${settings.value.rows}×${settings.value.columns} / ${settings.value.mode} / ` +
    `cross ${settings.value.isCrossHighlight ? 'on' : 'off'} / ` +
    `drag ${settings.value.isDragEnabled ? 'on' : 'off'}`
)

function createEmptyDomSnapshot(): DomSnapshot {
  return {
    rows: 0,
    columns: 0,
    bodyCells: 0,
    editors: 0,
    activeRow: null,
    activeColumn: null
  }
}

const createColumns = (count: number): BenchmarkColumn[] =>
  Array.from({ length: count }, (_, index) => ({
    key: `column${index + 1}`,
    label: `Column ${index + 1}`
  }))

const createRows = (rowCount: number, columns: BenchmarkColumn[]): BenchmarkRow[] =>
  Array.from({ length: rowCount }, (_, rowIndex) => {
    const row: BenchmarkRow = { id: `row-${rowIndex + 1}` }
    for (let columnIndex = 0; columnIndex < columns.length; columnIndex += 1) {
      row[columns[columnIndex].key] = `R${rowIndex + 1}C${columnIndex + 1}`
    }
    return row
  })

const readCell = (row: BenchmarkRow, key: string) => String(row[key] ?? '')

const writeCell = (row: BenchmarkRow, key: string, value: string) => {
  row[key] = value
}

const probeCellClass = () => {
  cellClassCalls += 1
  return ''
}

const probeHeaderCellClass = () => {
  headerClassCalls += 1
  return ''
}

const isDirectionKey = (key: string): key is DirectionKey =>
  key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight'

const percentile = (values: number[], ratio: number) => {
  if (values.length === 0) {
    return 0
  }

  const sorted = [...values].sort((left, right) => left - right)
  const index = Math.min(Math.ceil(sorted.length * ratio) - 1, sorted.length - 1)
  return sorted[Math.max(index, 0)]
}

function summarizeSamples(items: KeySample[]) {
  const durations = items.map((item) => item.durationMs)
  return {
    count: items.length,
    p50Ms: percentile(durations, 0.5),
    p95Ms: percentile(durations, 0.95),
    maxMs: durations.length > 0 ? Math.max(...durations) : 0,
    overFrameBudget: durations.filter((duration) => duration > 16.7).length,
    longTasks: durations.filter((duration) => duration > 50).length
  }
}

const resolveDomSnapshot = (): DomSnapshot => {
  const host = benchmarkHostRef.value
  if (!host) {
    return createEmptyDomSnapshot()
  }

  const rows = Array.from(
    host.querySelectorAll<HTMLTableRowElement>('.el-table__body-wrapper tbody tr')
  )
  const cells = host.querySelectorAll<HTMLElement>('.el-table__body-wrapper td.el-table__cell')
  const activeCell = host.querySelector<HTMLElement>(
    '.el-table__body-wrapper td.fl-table__cross-active'
  )
  const activeRowElement = activeCell?.parentElement

  return {
    rows: rows.length,
    columns: rows[0]?.querySelectorAll('td.el-table__cell').length ?? 0,
    bodyCells: cells.length,
    editors: host.querySelectorAll('.table-performance-grid__editor').length,
    activeRow: activeRowElement ? rows.indexOf(activeRowElement as HTMLTableRowElement) + 1 : null,
    activeColumn: activeCell
      ? Array.from(activeRowElement?.querySelectorAll('td.el-table__cell') ?? []).indexOf(
          activeCell
        ) + 1
      : null
  }
}

const getPerformanceSnapshot = (): PerformanceSnapshot => ({
  settings: { ...settings.value },
  dom: { ...latestDomSnapshot },
  samples: samples.map((item) => ({ ...item })),
  summary: summarizeSamples(samples)
})

const renderMetrics = () => {
  const output = metricsOutputRef.value
  if (!output) {
    return
  }

  const snapshot = getPerformanceSnapshot()
  output.textContent = JSON.stringify(snapshot, null, 2)
  output.dataset.sampleCount = String(snapshot.summary.count)
  output.dataset.bodyCells = String(snapshot.dom.bodyCells)
  output.dataset.editors = String(snapshot.dom.editors)
}

const resetMetrics = () => {
  samples = []
  cellClassCalls = 0
  headerClassCalls = 0
  latestDomSnapshot = resolveDomSnapshot()
  renderMetrics()
}

const waitForTwoFrames = () =>
  new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve())
    })
  })

const handleWindowKeydown = (event: KeyboardEvent) => {
  if (
    !isDirectionKey(event.key) ||
    !benchmarkHostRef.value?.querySelector('.fl-table__cross-active')
  ) {
    return
  }

  const startedAt = performance.now()
  const initialCellClassCalls = cellClassCalls
  const initialHeaderClassCalls = headerClassCalls
  const key = event.key

  void waitForTwoFrames().then(() => {
    latestDomSnapshot = resolveDomSnapshot()
    samples.push({
      sequence: samples.length + 1,
      key,
      durationMs: Number((performance.now() - startedAt).toFixed(2)),
      cellClassCalls: cellClassCalls - initialCellClassCalls,
      headerClassCalls: headerClassCalls - initialHeaderClassCalls,
      activeRow: latestDomSnapshot.activeRow,
      activeColumn: latestDomSnapshot.activeColumn
    })
    renderMetrics()
  })
}

const rebuildBenchmark = async () => {
  const currentSequence = ++rebuildSequence
  const columns = createColumns(settings.value.columns)
  benchmarkColumns.value = columns
  benchmarkRows.value = createRows(settings.value.rows, columns)
  renderKey.value += 1
  samples = []
  latestDomSnapshot = createEmptyDomSnapshot()
  renderMetrics()

  await nextTick()
  await waitForTwoFrames()
  if (currentSequence !== rebuildSequence) {
    return
  }

  resetMetrics()
}

const replaceQuery = (patch: Record<string, string>) => {
  void router.replace({
    query: {
      ...route.query,
      ...patch
    }
  })
}

const handleDimensionChange = (key: 'rows' | 'cols', event: Event) => {
  const input = event.target as HTMLInputElement
  replaceQuery({ [key]: String(parseSize(input.value)) })
}

const handleModeChange = (event: Event) => {
  const select = event.target as HTMLSelectElement
  replaceQuery({ mode: select.value === 'editor' ? 'editor' : 'plain' })
}

const handleBooleanChange = (key: 'cross' | 'drag', event: Event) => {
  const input = event.target as HTMLInputElement
  replaceQuery({ [key]: input.checked ? '1' : '0' })
}

watch(
  () => [
    settings.value.rows,
    settings.value.columns,
    settings.value.mode,
    settings.value.isCrossHighlight,
    settings.value.isDragEnabled
  ],
  () => {
    void rebuildBenchmark()
  },
  { immediate: true }
)

onMounted(() => {
  window.addEventListener('keydown', handleWindowKeydown, true)
  window.__flTablePerformance = {
    getSnapshot: getPerformanceSnapshot,
    reset: resetMetrics
  }
})

onBeforeUnmount(() => {
  rebuildSequence += 1
  window.removeEventListener('keydown', handleWindowKeydown, true)
  delete window.__flTablePerformance
})
</script>

<style scoped>
.table-performance-page {
  display: grid;
  gap: 16px;
}

.table-performance-page__header {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  justify-content: space-between;
}

.table-performance-page__eyebrow {
  margin: 0 0 6px;
  color: var(--play-accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.table-performance-page__reset {
  flex: 0 0 auto;
  padding: 8px 12px;
  border: 1px solid var(--play-accent);
  border-radius: 8px;
  color: var(--play-accent);
  background: var(--play-surface);
  cursor: pointer;
}

.table-performance-controls,
.table-performance-status,
.table-performance-metrics,
.table-performance-grid {
  border: 1px solid var(--play-border);
  border-radius: 12px;
  background: var(--play-surface);
}

.table-performance-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 18px;
  align-items: end;
  padding: 14px;
}

.table-performance-controls label {
  display: grid;
  gap: 6px;
  min-width: 124px;
  color: var(--play-text-secondary);
  font-size: 13px;
}

.table-performance-controls input[type='number'],
.table-performance-controls select {
  min-height: 36px;
  padding: 6px 9px;
  border: 1px solid var(--play-border);
  border-radius: 7px;
  color: var(--play-text);
  background: #fff;
}

.table-performance-controls .table-performance-controls__check {
  display: flex;
  gap: 8px;
  align-items: center;
  min-height: 36px;
}

.table-performance-status {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  overflow: hidden;
  background: var(--play-border);
}

.table-performance-status > div {
  display: grid;
  gap: 5px;
  padding: 12px 14px;
  background: var(--play-surface);
}

.table-performance-status span {
  color: var(--play-text-secondary);
  font-size: 12px;
}

.table-performance-metrics {
  display: grid;
  grid-template-columns: minmax(220px, 0.7fr) minmax(0, 1.3fr);
  gap: 18px;
  padding: 14px;
}

.table-performance-metrics h3,
.table-performance-metrics p {
  margin: 0;
}

.table-performance-metrics p {
  margin-top: 6px;
  color: var(--play-text-secondary);
  font-size: 13px;
  line-height: 1.5;
}

.table-performance-metrics pre {
  max-height: 220px;
  margin: 0;
  padding: 10px;
  overflow: auto;
  border-radius: 8px;
  color: #d9e2f2;
  background: #172033;
  font-size: 12px;
  line-height: 1.45;
}

.table-performance-grid {
  padding: 12px;
  overflow: hidden;
}

.table-performance-grid__value {
  white-space: nowrap;
}

.table-performance-grid :deep(.el-table .cell) {
  padding-right: 8px;
  padding-left: 8px;
}

.table-performance-grid :deep(.el-input__wrapper) {
  min-width: 0;
}

@media (max-width: 760px) {
  .table-performance-page__header,
  .table-performance-metrics {
    grid-template-columns: 1fr;
  }

  .table-performance-page__header {
    display: grid;
  }

  .table-performance-status {
    grid-template-columns: 1fr;
  }
}
</style>
