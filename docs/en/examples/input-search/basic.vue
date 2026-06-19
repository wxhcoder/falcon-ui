<template>
  <div class="demo-col">
    <FlInputSearch
      v-model="value"
      v-model:label="label"
      clearable
      placeholder="Enter globex and press Enter to auto backfill"
      :fetch-api="fetchApi"
      :map-result="mapResult" />

    <div class="demo-result">Bound value:{{ value ?? '(null)' }}</div>
    <div class="demo-result">Display label:{{ label || '(empty)' }}</div>
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
  { id: 'c-2001', name: 'Globex Inc.' }
]

const value = ref<string | number | null>(null)
const label = ref('')

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
</script>

<style scoped>
.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
