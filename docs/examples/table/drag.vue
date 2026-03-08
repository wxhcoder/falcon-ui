<template>
  <div class="demo-col">
    <FlTable
      :data="rows"
      style="width: 100%"
      @row-order-change="handleRowOrderChange"
      @column-order-change="handleColumnOrderChange">
      <el-table-column prop="id" label="ID" width="90" />
      <el-table-column prop="name" label="任务名称" min-width="180" />
      <el-table-column prop="priority" label="优先级" min-width="120" />
    </FlTable>

    <div class="demo-result">行顺序事件：{{ rowOrderText || '（无）' }}</div>
    <div class="demo-result">列顺序事件：{{ columnOrderText || '（无）' }}</div>
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
  { id: 4001, name: '任务 A', priority: 'P1' },
  { id: 4002, name: '任务 B', priority: 'P2' },
  { id: 4003, name: '任务 C', priority: 'P3' }
])

const rowOrderText = ref('')
const columnOrderText = ref('')

const handleRowOrderChange = (payload: RowOrderPayload) => {
  rowOrderText.value = `旧索引=${payload.oldIndex}, 新索引=${payload.newIndex}, 行ID序列=${payload.data
    .map((item) => item.id)
    .join(' > ')}`
  rows.value = payload.data
}

const handleColumnOrderChange = (payload: ColumnOrderPayload) => {
  columnOrderText.value = `旧索引=${payload.oldIndex}, 新索引=${payload.newIndex}, 列序列=${payload.order.join(' > ')}`
}
</script>

<style scoped>
.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
