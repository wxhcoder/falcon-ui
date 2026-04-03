<template>
  <div class="demo-col">
    <div class="demo-toolbar">
      <span class="demo-toolbar__label">开启交叉高亮</span>
      <el-switch v-model="crossHighlight" />

      <span class="demo-toolbar__label">行数</span>
      <FlInputNumber v-model="rowCount" :min="1" :max="300" :precision="0" />

      <span class="demo-toolbar__label">列数</span>
      <FlInputNumber v-model="columnCount" :min="1" :max="50" :precision="0" />

      <span class="demo-toolbar__summary">
        {{ rowCount }} 行 × {{ columnCount }} 列动态编辑列
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
            <FlInput v-model="row[column.key]" is-table :placeholder="`请输入${column.label}`" />
          </FlTableEditor>
        </template>
      </el-table-column>
    </FlTable>

    <div class="demo-result">最近一次变更：{{ lastChangeText || '（无）' }}</div>
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
    label: `字段 ${index + 1}`
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
    `行索引=${payload.rowIndex}`,
    `行主键=${payload.rowKey}`,
    `字段路径=${payload.path}`,
    `旧值=${String(payload.prevValue)}`,
    `新值=${String(payload.nextValue)}`
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
