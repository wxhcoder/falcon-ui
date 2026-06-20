<template>
  <div class="demo-col">
    <div class="demo-actions">
      <span class="demo-label">表格错误态</span>
      <ElSwitch v-model="isError" />
    </div>

    <ElTable :data="tableData" border style="width: 100%">
      <ElTableColumn label="编号" prop="id" width="90" />
      <ElTableColumn label="成员" prop="name" />
      <ElTableColumn label="部门" width="260">
        <template #default="{ row }">
          <FlTreeSelect
            v-model="row.department"
            :data="departmentTree"
            is-table
            :is-error="isError"
            placeholder="请选择部门" />
        </template>
      </ElTableColumn>
    </ElTable>

    <div class="demo-result">isError：{{ isError ? '开启' : '关闭' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type RowData = {
  id: string
  name: string
  department: string
}

const isError = ref(false)

const tableData = ref<RowData[]>([
  { id: 'U-001', name: '林澈', department: 'frontend' },
  { id: 'U-002', name: '周安', department: 'backend' },
  { id: 'U-003', name: '许宁', department: 'design' }
])

const departmentTree = [
  {
    value: 'engineering',
    label: '工程部',
    children: [
      { value: 'frontend', label: '前端组' },
      { value: 'backend', label: '后端组' }
    ]
  },
  {
    value: 'design',
    label: '设计部'
  }
]
</script>

<style scoped>
.demo-actions {
  align-items: center;
  display: flex;
  gap: 8px;
}

.demo-label {
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
