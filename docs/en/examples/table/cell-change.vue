<template>
  <div class="demo-col">
    <div class="demo-toolbar">
      <span class="demo-toolbar__label">Enable cross highlight</span>
      <el-switch v-model="crossHighlight" />
    </div>

    <FlTable
      :data="rows"
      :cross-highlight="crossHighlight"
      style="width: 100%"
      @cell-change="handleCellChange">
      <el-table-column prop="id" label="ID" width="90" />
      <el-table-column label="Name" min-width="180">
        <template #default="{ row }">
          <FlTableEditor mode="text">
            <FlInput v-model="row.name" is-table placeholder="Enter Name" />
          </FlTableEditor>
        </template>
      </el-table-column>
      <el-table-column label="Category" width="180">
        <template #default="{ row }">
          <FlTableEditor mode="controlled">
            <FlSelect v-model="row.category" is-table placeholder="TextCategory">
              <el-option
                v-for="item in categoryOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value" />
            </FlSelect>
          </FlTableEditor>
        </template>
      </el-table-column>
      <el-table-column label="Amount" width="160">
        <template #default="{ row }">
          <FlTableEditor mode="text">
            <FlInputNumber v-model="row.amount" is-table :min="0" :precision="0" />
          </FlTableEditor>
        </template>
      </el-table-column>
      <el-table-column label="Planned Date" width="200">
        <template #default="{ row }">
          <FlTableEditor mode="controlled">
            <FlDatePicker
              v-model="row.planDate"
              is-table
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="Select a date" />
          </FlTableEditor>
        </template>
      </el-table-column>
    </FlTable>

    <div class="demo-result">Latest change:{{ lastChangeText || '(none)' }}</div>
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
  { label: 'Office', value: 'office' },
  { label: 'R&D', value: 'rd' },
  { label: 'Operations', value: 'ops' }
]

const rows: TableRow[] = [
  { id: 3001, name: 'Item A', category: 'office', amount: 12, planDate: '2026-03-10' },
  { id: 3002, name: 'Item B', category: 'rd', amount: 8, planDate: '2026-03-12' },
  { id: 3003, name: 'Item C', category: 'ops', amount: 5, planDate: '2026-03-15' }
]

const crossHighlight = ref(true)
const lastChangeText = ref('')

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
