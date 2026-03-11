<template>
  <div class="demo-col">
    <div class="demo-toolbar">
      <span class="demo-toolbar__label">开启交叉高亮</span>
      <el-switch v-model="crossHighlight" />
    </div>

    <FlTable
      :data="rows"
      :cross-highlight="crossHighlight"
      style="width: 100%"
      @cell-change="handleCellChange">
      <el-table-column prop="id" label="ID" width="90" />
      <el-table-column label="名称" min-width="180">
        <template #default="{ row }">
          <FlInput v-model="row.name" is-table placeholder="请输入名称" />
        </template>
      </el-table-column>
      <el-table-column label="分类" width="180">
        <template #default="{ row }">
          <FlSelect v-model="row.category" is-table placeholder="请选择分类">
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value" />
          </FlSelect>
        </template>
      </el-table-column>
      <el-table-column label="数量" width="160">
        <template #default="{ row }">
          <FlInputNumber v-model="row.amount" is-table :min="0" :precision="0" />
        </template>
      </el-table-column>
      <el-table-column label="计划日期" width="200">
        <template #default="{ row }">
          <FlDatePicker
            v-model="row.planDate"
            is-table
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择日期" />
        </template>
      </el-table-column>
    </FlTable>

    <div class="demo-result">最近一次变更：{{ lastChangeText || '（无）' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface TableRow {
  id: number
  name: string
  category: string
  amount: number
  planDate: string
}

interface CellChangePayload {
  rowIndex: number
  rowKey: string | number
  path: string
  prevValue: unknown
  nextValue: unknown
}

const categoryOptions = [
  { label: '办公', value: 'office' },
  { label: '研发', value: 'rd' },
  { label: '运营', value: 'ops' }
]

const rows: TableRow[] = [
  { id: 3001, name: '条目 A', category: 'office', amount: 12, planDate: '2026-03-10' },
  { id: 3002, name: '条目 B', category: 'rd', amount: 8, planDate: '2026-03-12' },
  { id: 3003, name: '条目 C', category: 'ops', amount: 5, planDate: '2026-03-15' }
]

const crossHighlight = ref(true)
const lastChangeText = ref('')

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
  gap: 12px;
  margin-bottom: 12px;
}

.demo-toolbar__label {
  color: var(--vp-c-text-1);
  font-size: 14px;
}

.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
