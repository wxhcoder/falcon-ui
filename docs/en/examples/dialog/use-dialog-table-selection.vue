<template>
  <div class="demo-col">
    <FlButton type="primary" @click="openByUseDialog"
      >Open table selection dialog with useDialog</FlButton
    >
    <div class="demo-result">Latest confirmed rows:{{ confirmedRowIds || '(none)' }}</div>
    <div class="demo-result">Latest close action:{{ latestRejectedAction || '(none)' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ElTable, ElTableColumn } from 'element-plus'
import type { DialogRejectPayload } from '@falcon-ui/hooks'
import { useDialog } from '@falcon-ui/hooks'
import { computed, h, ref } from 'vue'

interface CustomerRow {
  id: string
  name: string
  contact: string
}

const dialog = useDialog()
const confirmedRows = ref<CustomerRow[]>([])
const latestRejectedAction = ref('')

const tableData: CustomerRow[] = [
  { id: 'C-1001', name: 'Acme Co., Ltd.', contact: 'Alice' },
  { id: 'C-1002', name: 'Contoso Trading', contact: 'Bob' },
  { id: 'C-1003', name: 'Globex Logistics', contact: 'Carol' }
]

const confirmedRowIds = computed(() => confirmedRows.value.map((row) => row.id).join(', '))

const renderSelectionTable = () =>
  h(
    ElTable,
    {
      data: tableData,
      border: true,
      height: 240
    },
    () => [
      h(ElTableColumn, { type: 'selection', width: 52 }),
      h(ElTableColumn, { label: 'ID', prop: 'id', width: 100 }),
      h(ElTableColumn, { label: 'Customer Name', prop: 'name' }),
      h(ElTableColumn, { label: 'Contact', prop: 'contact', width: 140 })
    ]
  )

const openByUseDialog = () => {
  latestRejectedAction.value = ''

  dialog
    .open<CustomerRow[]>({
      title: 'useDialog table selection',
      message: renderSelectionTable,
      payloadMethod: 'getSelectionRows',
      dialogProps: {
        bodyHeight: 320
      }
    })
    .then(({ data }) => {
      confirmedRows.value = [...data]
    })
    .catch(({ action }: DialogRejectPayload) => {
      latestRejectedAction.value = action
    })
}
</script>

<style scoped>
.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
