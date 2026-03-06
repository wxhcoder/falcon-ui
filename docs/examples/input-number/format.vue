<template>
  <div class="demo-col">
    <FlInputNumber
      v-model="defaultFormatValue"
      :is-format="true"
      placeholder="默认千分位格式化（显示）" />

    <FlInputNumber
      v-model="customFormatValue"
      :is-format="true"
      :formatter="currencyFormatter"
      :parser="currencyParser"
      placeholder="自定义 formatter/parser（显示）" />

    <div class="demo-result">默认格式化绑定值：{{ defaultFormatValue ?? '(null)' }}</div>
    <div class="demo-result">自定义格式化绑定值：{{ customFormatValue ?? '(null)' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const defaultFormatValue = ref<number | null>(12345.67)
const customFormatValue = ref<number | null>(9800)

const currencyFormatter = (value: string) => `USD ${value}`
const currencyParser = (value: string) => value.replace(/^USD\s*/, '')
</script>

<style scoped>

.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
