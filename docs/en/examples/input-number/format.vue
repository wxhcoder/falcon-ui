<template>
  <div class="demo-col">
    <FlInputNumber
      v-model="defaultFormatValue"
      :is-format="true"
      placeholder="Default thousands formatting (display)" />

    <FlInputNumber
      v-model="customFormatValue"
      :is-format="true"
      :formatter="currencyFormatter"
      :parser="currencyParser"
      placeholder="Custom formatter/parser (display)" />

    <div class="demo-result">
      Default formatted bound value:{{ defaultFormatValue ?? '(null)' }}
    </div>
    <div class="demo-result">Custom formatted bound value:{{ customFormatValue ?? '(null)' }}</div>
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
