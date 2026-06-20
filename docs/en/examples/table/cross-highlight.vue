<template>
  <div class="demo-col">
    <div class="demo-tip">
      Click any data cell to observe cross highlight on the current row, current column and header
      column. The current cell keeps its original background, and uses only a border for focus
      emphasis. Toggle "fix first 3 columns" to observe highlight behavior with fixed columns.
    </div>

    <div class="demo-toolbar">
      <span class="demo-toolbar__label">Fix first 3 columns</span>
      <el-switch v-model="isFixedColumns" />
    </div>

    <FlTable :data="rows" cross-highlight style="width: 100%">
      <el-table-column :fixed="leftFixed" prop="id" label="ID" width="90" />
      <el-table-column :fixed="leftFixed" prop="name" label="Name" width="180" />
      <el-table-column :fixed="leftFixed" prop="status" label="Status" width="140" />
      <el-table-column prop="owner" label="Owner" min-width="140" />
      <el-table-column prop="region" label="Region" min-width="140" />
      <el-table-column prop="category" label="Industry" min-width="160" />
      <el-table-column prop="level" label="Level" min-width="120" />
      <el-table-column prop="updatedAt" label="Last Updated" min-width="180" />
      <el-table-column prop="remark" label="Remark" min-width="220" />
    </FlTable>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface TableRow {
  id: number
  name: string
  status: string
  owner: string
  region: string
  category: string
  level: string
  updatedAt: string
  remark: string
}

const isFixedColumns = ref(false)

const leftFixed = computed(() => (isFixedColumns.value ? 'left' : undefined))

const rows: TableRow[] = [
  {
    id: 1001,
    name: 'Alpha Tech',
    status: 'Enabled',
    owner: 'Mia Wang',
    region: 'East China',
    category: 'Enterprise Services',
    level: 'A',
    updatedAt: '2026-03-10 09:20',
    remark: 'Quarterly renewal in progress'
  },
  {
    id: 1002,
    name: 'Beta Logistics',
    status: 'Pending',
    owner: 'Leo Liu',
    region: 'North China',
    category: 'Logistics',
    level: 'B',
    updatedAt: '2026-03-11 14:35',
    remark: 'Qualification materials pending'
  },
  {
    id: 1003,
    name: 'Gamma Retail',
    status: 'Disabled',
    owner: 'Zoe Chen',
    region: 'South China',
    category: 'New Retail',
    level: 'C',
    updatedAt: '2026-03-12 17:10',
    remark: 'Archived historical cooperation'
  }
]
</script>

<style scoped>
.demo-tip {
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.6;
}

.demo-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 12px 0 16px;
}

.demo-toolbar__label {
  color: var(--vp-c-text-1);
  font-size: 13px;
}
</style>
