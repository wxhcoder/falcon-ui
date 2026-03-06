<template>
  <div class="demo-col">
    <FlInputSearch
      v-model="value"
      v-model:label="label"
      clearable
      placeholder="输入 acme 回车，useDialog 渲染表格并回填勾选行"
      :fetch-api="fetchApi"
      :map-result="mapResult"
      @open-dialog="handleOpenDialog" />

    <div class="demo-result">openDialog 次数：{{ panelCount }}</div>
    <div class="demo-result">最近原因：{{ panelReason || '(none)' }}</div>
    <div class="demo-result">
      关键词 / 结果数：{{ panelKeyword || '(empty)' }} / {{ panelSize }}
    </div>
    <div class="demo-result">当前回填：{{ value ?? '(null)' }} / {{ label || '(empty)' }}</div>
    <div class="demo-result">useDialog 确认次数：{{ confirmCount }}</div>
    <div class="demo-result">useDialog 最近拒绝动作：{{ latestRejectedAction || '(none)' }}</div>
    <div class="demo-result">最近确认行：{{ latestConfirmedRows || '(none)' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ElTable, ElTableColumn } from 'element-plus'
import type { DialogRejectPayload } from '@falcon-ui/hooks'
import { useDialog } from '@falcon-ui/hooks'
import { h, ref } from 'vue'

type SearchItem = {
  id: string
  name: string
}

const data: SearchItem[] = [
  { id: 'c-1001', name: 'Acme Corporation' },
  { id: 'c-1002', name: 'Acme Retail' },
  { id: 'c-1003', name: 'Acme Logistics' }
]

const value = ref<string | number | null>(null)
const label = ref('')
const panelCount = ref(0)
const panelReason = ref('')
const panelKeyword = ref('')
const panelSize = ref(0)
const confirmCount = ref(0)
const latestRejectedAction = ref('')
const latestConfirmedRows = ref('')
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

const renderSelectionTable = (rows: SearchItem[]) =>
  h(
    ElTable,
    {
      data: rows,
      border: true,
      height: 240
    },
    () => [
      h(ElTableColumn, { type: 'selection', width: 52 }),
      h(ElTableColumn, { label: 'ID', prop: 'id', width: 120 }),
      h(ElTableColumn, { label: '客户名称', prop: 'name' })
    ]
  )

const handleOpenDialog = (payload: {
  keyword: string
  reason: 'manual' | 'multi-match'
  results?: unknown[]
}) => {
  panelCount.value += 1
  panelReason.value = payload.reason
  panelKeyword.value = payload.keyword
  panelSize.value = payload.results?.length ?? 0

  latestRejectedAction.value = ''
  latestConfirmedRows.value = ''

  const dialogRows = payload.results
    ? payload.results.map((item) => {
        const record = item as SearchItem
        return {
          id: record?.id ?? '',
          name: record?.name ?? ''
        }
      })
    : data.filter((item) => {
        const normalized = payload.keyword.trim().toLowerCase()
        if (!normalized) {
          return true
        }

        return item.name.toLowerCase().includes(normalized)
      })

  dialog
    .open<SearchItem[]>({
      title: '选择客户（useDialog）',
      message: () => renderSelectionTable(dialogRows),
      payloadMethod: 'getSelectionRows',
      dialogProps: {
        bodyHeight: 280
      }
    })
    .then(({ data }) => {
      confirmCount.value += 1
      latestConfirmedRows.value = data.map((row) => `${row.id}:${row.name}`).join(', ')

      if (data.length > 0) {
        value.value = data[0].id
        label.value = data[0].name
      }
    })
    .catch(({ action }: DialogRejectPayload) => {
      latestRejectedAction.value = action
    })
}
</script>

<style scoped>
.demo-col {
  width: 100%;
  display: grid;
  gap: 10px;
  max-width: 420px;
}

.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
