<template>
  <div class="demo-col">
    <div class="demo-actions">
      <FlButton @click="isError = !isError">
        {{ isError ? '关闭错误状态' : '开启错误状态' }}
      </FlButton>
    </div>

    <FlInput v-model="value" :is-error="isError" placeholder="输入内容后切换错误状态，值会被清空" />

    <div class="demo-result">错误状态：{{ isError ? '开启' : '关闭' }}</div>
    <div class="demo-result">当前值：{{ value || '(空)' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const value = ref('')
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
