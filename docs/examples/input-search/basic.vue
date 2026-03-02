<template>
  <div class="demo-col">
    <FlInputSearch
      v-model="value"
      v-model:label="label"
      clearable
      placeholder="输入 globex 回车可自动回填"
      :fetch-api="fetchApi"
      :map-result="mapResult" />

    <div class="demo-result">绑定值（value）：{{ value ?? '(null)' }}</div>
    <div class="demo-result">显示值（label）：{{ label || '(empty)' }}</div>
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
