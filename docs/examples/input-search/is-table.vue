<template>
  <div class="demo-col">
    <ElTable :data="tableData" border style="width: 100%">
      <ElTableColumn label="订单编号" prop="orderNo" width="130" />
      <ElTableColumn label="客户" min-width="260">
        <template #default="{ row }">
          <FlInputSearch
            v-model="row.customerId"
            v-model:label="row.customerName"
            clearable
            is-table
            placeholder="输入 globex 后回车"
            :fetch-api="fetchApi"
            :map-result="mapResult"
            @open-dialog="handleOpenDialog(row, $event)" />
        </template>
      </ElTableColumn>
      <ElTableColumn label="绑定客户 ID" min-width="160">
        <template #default="{ row }">
          {{ row.customerId ?? '（未选择）' }}
        </template>
      </ElTableColumn>
    </ElTable>

    <div class="demo-result">输入唯一客户关键词并按回车，可同时更新客户名称与业务 ID。</div>
  </div>
</template>

<script setup lang="ts">
import { FlTable } from '@falcon-ui/components'
import { useDialog } from '@falcon-ui/hooks'
import { ElTableColumn } from 'element-plus'
import { h, ref } from 'vue'

type Customer = {
  id: string
  name: string
}

type OrderRow = {
  orderNo: string
  customerId: string | null
  customerName: string
}

type OpenDialogEvent = {
  keyword: string
  reason: 'manual' | 'multi-match'
  results?: unknown[]
}

const customers: Customer[] = [
  { id: 'c-1001', name: 'Acme Corporation' },
  { id: 'c-2001', name: 'Globex Inc.' },
  { id: 'c-3001', name: 'Initech' }
]

const tableData = ref<OrderRow[]>([
  { orderNo: 'SO-2026-001', customerId: 'c-1001', customerName: 'Acme Corporation' },
  { orderNo: 'SO-2026-002', customerId: null, customerName: '' },
  { orderNo: 'SO-2026-003', customerId: 'c-3001', customerName: 'Initech' }
])
const dialog = useDialog()

const fetchApi = async (keyword: string) => {
  const normalized = keyword.trim().toLowerCase()
  if (!normalized) {
    return []
  }

  return customers.filter((customer) => customer.name.toLowerCase().includes(normalized))
}

const mapResult = (item: unknown) => {
  const customer = item as Customer

  return {
    value: customer?.id ?? null,
    label: customer?.name ?? ''
  }
}

const resolveDialogRows = (event: OpenDialogEvent) => {
  if (event.results) {
    return event.results.map((item) => {
      const customer = item as Customer

      return {
        id: customer?.id ?? '',
        name: customer?.name ?? ''
      }
    })
  }

  const normalized = event.keyword.trim().toLowerCase()
  if (!normalized) {
    return customers
  }

  return customers.filter((customer) => customer.name.toLowerCase().includes(normalized))
}

const renderSelectionTable = (rows: Customer[]) =>
  h(
    FlTable,
    {
      data: rows,
      border: true,
      height: 240,
      selectionSingle: true
    },
    () => [
      h(ElTableColumn, { type: 'selection', width: 52 }),
      h(ElTableColumn, { label: 'ID', prop: 'id', width: 120 }),
      h(ElTableColumn, { label: '客户名称', prop: 'name' })
    ]
  )

const handleOpenDialog = (row: OrderRow, event: OpenDialogEvent) => {
  const dialogRows = resolveDialogRows(event)

  dialog
    .open<Customer[]>({
      title: `为 ${row.orderNo} 选择客户`,
      message: () => renderSelectionTable(dialogRows),
      payloadMethod: 'getSelectionRows',
      dialogProps: {
        bodyHeight: 280
      }
    })
    .then(({ data: selectedRows }) => {
      const selectedRow = selectedRows[0]
      if (!selectedRow) {
        return
      }

      row.customerId = selectedRow.id
      row.customerName = selectedRow.name
    })
    .catch(() => undefined)
}
</script>

<style scoped>
.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
