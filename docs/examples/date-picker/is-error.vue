<template>
  <div class="demo-col">
    <div class="demo-actions">
      <FlButton @click="isError = !isError">
        {{ isError ? '关闭错误状态' : '开启错误状态' }}
      </FlButton>
    </div>

    <FlDatePicker
      v-model="value"
      :is-error="isError"
      type="date"
      value-format="YYYY-MM-DD"
      placeholder="选择日期后切换错误状态，值会清空" />

    <div class="demo-result">错误状态：{{ isError ? '开启' : '关闭' }}</div>
    <div class="demo-result">当前值：{{ value ?? '(null)' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const value = ref<string | null>(null)
const isError = ref(false)
</script>

<style scoped>

.demo-actions {
  display: flex;
}

.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
