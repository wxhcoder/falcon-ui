<template>
  <div class="vp-raw">
    <ElTable :data="tableData" border style="width: 100%">
      <ElTableColumn label="序号" prop="id" width="80" />
      <ElTableColumn label="任务" prop="task" width="180" />
      <ElTableColumn label="计划日期">
        <template #default="{ row }">
          <FlDatePicker
            v-model="row.planDate"
            is-table
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择日期" />
        </template>
      </ElTableColumn>
    </ElTable>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type RowData = {
  id: number
  task: string
  planDate: string | null
}

const tableData = ref<RowData[]>([
  { id: 1, task: '需求评审', planDate: null },
  { id: 2, task: '联调测试', planDate: null },
  { id: 3, task: '上线发布', planDate: null }
])
</script>
