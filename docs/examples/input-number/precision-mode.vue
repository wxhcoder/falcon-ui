<template>
  <div class="demo-col">
    <FlInputNumber
      v-model="roundValue"
      :precision="2"
      precision-mode="ROUND"
      placeholder="ROUND：1.236 => 1.24" />
    <FlInputNumber
      v-model="fixedValue"
      :precision="2"
      precision-mode="FIXED"
      placeholder="FIXED：1.236 => 1.23" />
    <FlInputNumber
      :is-error="strictError"
      :model-value="strictValue"
      :precision="2"
      precision-mode="STRICT"
      strict-error-placeholder="精度不对"
      placeholder="STRICT：精度超限会报错并清空"
      @strict-error="strictErrorCount += 1"
      @update:is-error="strictError = $event"
      @update:model-value="strictValue = $event" />

    <div class="demo-result">
      ROUND / FIXED / STRICT：{{ roundValue ?? '(null)' }} / {{ fixedValue ?? '(null)' }} /
      {{ strictValue ?? '(null)' }}
    </div>
    <div class="demo-result">STRICT 错误状态：{{ strictError ? '开启' : '关闭' }}</div>
    <div class="demo-result">STRICT 错误次数：{{ strictErrorCount }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const roundValue = ref<number | null>(null)
const fixedValue = ref<number | null>(null)
const strictValue = ref<number | null>(null)
const strictError = ref(false)
const strictErrorCount = ref(0)
</script>

<style scoped>

.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
