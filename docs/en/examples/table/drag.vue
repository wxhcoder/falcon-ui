<template>
  <div class="demo-col">
    <FlTable
      :data="rows"
      style="width: 100%"
      @row-order-change="handleRowOrderChange"
      @column-order-change="handleColumnOrderChange">
      <el-table-column prop="id" label="ID" width="90" />
      <el-table-column prop="name" label="TaskName" min-width="180" />
      <el-table-column prop="priority" label="Priority" min-width="120" />
    </FlTable>

    <div class="demo-result">Row order event:{{ rowOrderText || '(none)' }}</div>
    <div class="demo-result">Column order event:{{ columnOrderText || '(none)' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface TableRow {
  id: number
  name: string
  priority: string
}

interface RowOrderPayload {
  oldIndex: number
  newIndex: number
  data: TableRow[]
}

interface ColumnOrderPayload {
  oldIndex: number
  newIndex: number
  order: number[]
}

const rows = ref<TableRow[]>([
  { id: 4001, name: 'Task A', priority: 'P1' },
  { id: 4002, name: 'Task B', priority: 'P2' },
  { id: 4003, name: 'Task C', priority: 'P3' }
])

const rowOrderText = ref('')
const columnOrderText = ref('')

const handleRowOrderChange = (payload: RowOrderPayload) => {
  rowOrderText.value = `oldIndex=${payload.oldIndex}, newIndex=${payload.newIndex}, row ID order=${payload.data
    .map((item) => item.id)
    .join(' > ')}`
  rows.value = payload.data
}

const handleColumnOrderChange = (payload: ColumnOrderPayload) => {
  columnOrderText.value = `oldIndex=${payload.oldIndex}, newIndex=${payload.newIndex}, column order=${payload.order.join(' > ')}`
}
</script>

<style scoped>
.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
