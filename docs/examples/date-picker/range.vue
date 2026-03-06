<template>
  <div class="demo-col">
    <FlDatePicker
      v-model="rangeValue"
      type="daterange"
      unlink-panels
      value-format="YYYY-MM-DD"
      start-placeholder="开始日期"
      end-placeholder="结束日期" />
    <div class="demo-result">当前值：{{ rangeValue ? rangeValue.join(' ~ ') : '(null)' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const rangeValue = ref<[string, string] | null>(null)
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
