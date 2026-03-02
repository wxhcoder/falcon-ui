<template>
  <div class="demo-col">
    <FlInputSearch
      v-model="value"
      v-model:label="label"
      clearable
      placeholder="输入 acme 回车将触发 openDialog"
      :fetch-api="fetchApi"
      :map-result="mapResult"
      @open-dialog="handleOpenDialog" />

    <div class="demo-result">openDialog 次数：{{ panelCount }}</div>
    <div class="demo-result">最近原因：{{ panelReason || '(none)' }}</div>
    <div class="demo-result">关键词 / 结果数：{{ panelKeyword || '(empty)' }} / {{ panelSize }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

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

const handleOpenDialog = (payload: {
  keyword: string
  reason: 'manual' | 'multi-match'
  results?: unknown[]
}) => {
  panelCount.value += 1
  panelReason.value = payload.reason
  panelKeyword.value = payload.keyword
  panelSize.value = payload.results?.length ?? 0
}
</script>

<style scoped>
.demo-col {
  display: grid;
  gap: 10px;
  max-width: 420px;
}

.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
