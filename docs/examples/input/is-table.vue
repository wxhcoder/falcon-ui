<template>
  <div class="vp-raw">
    <ElTable :data="tableData" border style="width: 100%">
      <ElTableColumn label="序号" prop="id" width="80" />
      <ElTableColumn label="姓名" prop="name" width="140" />
      <ElTableColumn label="备注">
        <template #default="{ row }">
          <FlInput v-model="row.remark" is-table placeholder="请输入备注" />
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
  { id: 1, name: '张三', remark: '' },
  { id: 2, name: '李四', remark: '' },
  { id: 3, name: '王五', remark: '' }
])
</script>
