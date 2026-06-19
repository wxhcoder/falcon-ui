<template>
  <div class="demo-col">
    <div class="demo-toolbar">
      <span class="demo-toolbar__label">Enable cross highlight</span>
      <el-switch v-model="crossHighlight" />

      <span class="demo-toolbar__label">Rows</span>
      <FlInputNumber v-model="rowCount" :min="1" :max="300" :precision="0" />

      <span class="demo-toolbar__label">Columns</span>
      <FlInputNumber v-model="columnCount" :min="1" :max="50" :precision="0" />

      <span class="demo-toolbar__summary">
        {{ rowCount }} rows x {{ columnCount }} editable dynamic columns
      </span>
    </div>

    <FlTable
      :data="rows"
      :cross-highlight="crossHighlight"
      height="520"
      is-edit
      row-key-field="id"
      style="width: 100%"
      @cell-change="handleCellChange">
      <el-table-column prop="id" label="ID" width="90" />
      <el-table-column
        v-for="column in columns"
        :key="column.key"
        :label="column.label"
        min-width="180">
        <template #default="{ row }">
          <FlTableEditor mode="text">
            <FlInput v-model="row[column.key]" is-table :placeholder="`Enter ${column.label}`" />
          </FlTableEditor>
        </template>
      </el-table-column>
    </FlTable>

    <div class="demo-result">Latest change:{{ lastChangeText || '(none)' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface DynamicColumn {
  key: string
  label: string
}

type DynamicRow = {
  id: number
} & Record<string, string | number>

interface CellChangePayload {
  rowIndex: number
  rowKey: string | number
  path: string
  prevValue: unknown
  nextValue: unknown
}

const crossHighlight = ref(true)
const rowCount = ref(50)
const columnCount = ref(20)
const columns = ref<DynamicColumn[]>([])
const rows = ref<DynamicRow[]>([])
const lastChangeText = ref('')

const createColumns = (count: number): DynamicColumn[] =>
  Array.from({ length: count }, (_, index) => ({
    key: `col${index + 1}`,
    label: `Field ${index + 1}`
  }))

const createRow = (rowIndex: number, nextColumns: DynamicColumn[]): DynamicRow => {
  const row: DynamicRow = {
    id: 5001 + rowIndex
  }

  nextColumns.forEach((column, columnIndex) => {
    row[column.key] = `R${rowIndex + 1}-C${columnIndex + 1}`
  })

  return row
}

const rebuildTableData = () => {
  const nextColumns = createColumns(columnCount.value)
  columns.value = nextColumns
  rows.value = Array.from({ length: rowCount.value }, (_, index) => createRow(index, nextColumns))
  lastChangeText.value = ''
}

watch([rowCount, columnCount], rebuildTableData, { immediate: true })

const handleCellChange = (payload: CellChangePayload) => {
  lastChangeText.value = [
    `rowIndex=${payload.rowIndex}`,
    `rowKey=${payload.rowKey}`,
    `path=${payload.path}`,
    `previous=${String(payload.prevValue)}`,
    `next=${String(payload.nextValue)}`
  ].join(', ')
}
</script>

<style scoped>
.demo-toolbar {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.demo-toolbar__label {
  color: var(--vp-c-text-1);
  font-size: 14px;
}

.demo-toolbar__summary {
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
