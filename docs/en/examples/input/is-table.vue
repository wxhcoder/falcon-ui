<template>
  <div class="vp-raw">
    <ElTable :data="tableData" border style="width: 100%">
      <ElTableColumn label="No." prop="id" width="80" />
      <ElTableColumn label="Name" prop="name" width="140" />
      <ElTableColumn label="Remark">
        <template #default="{ row }">
          <FlInput v-model="row.remark" is-table placeholder="Enter Remark" />
        </template>
      </ElTableColumn>
    </ElTable>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type RowData = {
  id: number
  name: string
  remark: string
}

const tableData = ref<RowData[]>([
  { id: 1, name: 'Alex Zhang', remark: '' },
  { id: 2, name: 'Lee Li', remark: '' },
  { id: 3, name: 'Will Wang', remark: '' }
])
</script>
