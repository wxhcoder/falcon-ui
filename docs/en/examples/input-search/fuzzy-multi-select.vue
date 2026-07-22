<template>
  <div class="demo-col">
    <FlInputSearch
      v-model="value"
      v-model:label="label"
      clearable
      placeholder="Enter acme and press Enter to select from multiple matches"
      :fetch-api="fetchApi"
      :map-result="mapResult"
      @open-dialog="handleOpenDialog" />

    <div class="demo-result">Latest reason: {{ latestReason || '(none)' }}</div>
    <div class="demo-result">
      Current backfill: {{ value ?? '(null)' }} / {{ label || '(empty)' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { FlTable } from '@falcon-ui/components'
import { useDialog } from '@falcon-ui/hooks'
import { ElTableColumn } from 'element-plus'
import { h, ref } from 'vue'

type SearchItem = {
  id: string
  name: string
}

type OpenDialogEvent = {
  keyword: string
  reason: 'manual' | 'multi-match'
  results?: unknown[]
}

const data: SearchItem[] = [
  { id: 'c-1001', name: 'Acme Corporation' },
  { id: 'c-1002', name: 'Acme Retail' },
  { id: 'c-1003', name: 'Acme Logistics' },
  { id: 'c-2001', name: 'Globex Inc.' }
]

const value = ref<string | number | null>(null)
const label = ref('')
const latestReason = ref('')
const dialog = useDialog()

const fetchApi = async (keyword: string) => {
  const normalized = keyword.trim().toLowerCase()
  if (!normalized) {
    return []
  }

  return data.filter((item) => item.name.toLowerCase().includes(normalized))
}

const mapResult = (item: unknown) => {
  const record = item as SearchItem

  return {
    value: record?.id ?? null,
    label: record?.name ?? ''
  }
}

const resolveDialogRows = (event: OpenDialogEvent) => {
  if (event.results) {
    return event.results.map((item) => {
      const record = item as SearchItem

      return {
        id: record?.id ?? '',
        name: record?.name ?? ''
      }
    })
  }

  const normalized = event.keyword.trim().toLowerCase()
  if (!normalized) {
    return data
  }

  return data.filter((item) => item.name.toLowerCase().includes(normalized))
}

const renderSelectionTable = (rows: SearchItem[]) =>
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
      h(ElTableColumn, { label: 'Customer Name', prop: 'name' })
    ]
  )

const handleOpenDialog = (event: OpenDialogEvent) => {
  latestReason.value = event.reason
  const dialogRows = resolveDialogRows(event)

  dialog
    .open<SearchItem[]>({
      title: 'Select a Fuzzy Match',
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

      value.value = selectedRow.id
      label.value = selectedRow.name
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
