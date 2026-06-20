<template>
  <div class="demo-col">
    <div class="demo-actions">
      <FlButton @click="isError = !isError">
        {{ isError ? 'Disable isError' : 'Enable isError' }}
      </FlButton>
    </div>

    <div class="vp-raw">
      <ElTable :data="tableData" border style="width: 100%">
        <ElTableColumn label="No." prop="id" width="80" />
        <ElTableColumn label="Task" prop="task" width="180" />
        <ElTableColumn label="Planned Date">
          <template #default="{ row }">
            <FlDatePicker
              v-model="row.planDate"
              :is-error="isError"
              is-table
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="Select a date" />
          </template>
        </ElTableColumn>
      </ElTable>
    </div>

    <div class="demo-result">isError:{{ isError ? 'On (clears table date)' : 'Off' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type RowData = {
  id: number
  task: string
  planDate: string | null
}

const isError = ref(false)
const tableData = ref<RowData[]>([
  { id: 1, task: 'Requirements Review', planDate: null },
  { id: 2, task: 'Integration Test', planDate: null },
  { id: 3, task: 'Release', planDate: null }
])
</script>

<style scoped>
.demo-actions {
  display: flex;
}

.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
