<template>
  <div class="demo-col">
    <FlButton type="primary" @click="open = true">打开表格选择弹窗</FlButton>
    <div class="demo-result">实时勾选：{{ currentSelectedIds || '(none)' }}</div>
    <div class="demo-result">确认结果：{{ confirmedSelectedIds || '(none)' }}</div>

    <FlDialog v-model="open" :body-height="320" title="选择客户" @confirm="handleConfirm">
      <el-table :data="tableData" border height="240" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="52" />
        <el-table-column label="ID" prop="id" width="100" />
        <el-table-column label="客户名称" prop="name" />
        <el-table-column label="联系人" prop="contact" width="140" />
      </el-table>
    </FlDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface CustomerRow {
  id: string
  name: string
  contact: string
}

const open = ref(false)
const selectedRows = ref<CustomerRow[]>([])
const confirmedRows = ref<CustomerRow[]>([])

const tableData: CustomerRow[] = [
  { id: 'C-1001', name: 'Acme Co., Ltd.', contact: 'Alice' },
  { id: 'C-1002', name: 'Contoso Trading', contact: 'Bob' },
  { id: 'C-1003', name: 'Globex Logistics', contact: 'Carol' }
]

const toIdText = (rows: CustomerRow[]) => rows.map((row) => row.id).join(', ')

const currentSelectedIds = computed(() => toIdText(selectedRows.value))
const confirmedSelectedIds = computed(() => toIdText(confirmedRows.value))

const handleSelectionChange = (rows: CustomerRow[]) => {
  selectedRows.value = [...rows]
}

const handleConfirm = () => {
  confirmedRows.value = [...selectedRows.value]
}
</script>

<style scoped>
.demo-col {
  display: grid;
  gap: 10px;
}

.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
