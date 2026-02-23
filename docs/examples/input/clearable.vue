<template>
  <div class="demo-col">
    <FlInput v-model="value" clearable placeholder="输入后可点击右侧清空按钮" />
    <div class="demo-result">当前值：{{ value || '(空)' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const value = ref('')
</script>

<style scoped>
.demo-col {
  display: grid;
  gap: 10px;
}

.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
