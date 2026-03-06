<template>
  <div class="demo-col">
    <FlInputNumber v-model="value" placeholder="请输入数字" />
    <div class="demo-result">当前值：{{ value ?? '(null)' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const value = ref<number | null>(null)
</script>

<style scoped>

.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
