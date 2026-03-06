<template>
  <div class="demo-col">
    <FlInput v-model="value" placeholder="请输入内容" />
    <div class="demo-result">当前值：{{ value || '(空)' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const value = ref('')
</script>

<style scoped>

.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
