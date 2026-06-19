<template>
  <div class="demo-col">
    <div class="demo-actions">
      <span class="demo-label">Table error state</span>
      <ElSwitch v-model="isError" />
    </div>

    <ElTable :data="tableData" border style="width: 100%">
      <ElTableColumn label="ID" prop="id" width="90" />
      <ElTableColumn label="Product" prop="name" />
      <ElTableColumn label="Status" width="220">
        <template #default="{ row }">
          <FlSelect v-model="row.status" is-table :is-error="isError" placeholder="TextStatus">
            <ElOption
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value" />
          </FlSelect>
        </template>
      </ElTableColumn>
    </ElTable>

    <div class="demo-result">isError:{{ isError ? 'On' : 'Off' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type RowData = {
  id: string
  name: string
  status: string
}

const isError = ref(false)

const tableData = ref<RowData[]>([
  { id: 'SKU-001', name: 'Mechanical Keyboard', status: 'normal' },
  { id: 'SKU-002', name: 'Wireless Mouse', status: 'paused' },
  { id: 'SKU-003', name: 'Monitor', status: 'offline' }
])

const statusOptions = [
  { label: 'Active', value: 'normal' },
  { label: 'Paused', value: 'paused' },
  { label: 'Offline', value: 'offline' }
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
