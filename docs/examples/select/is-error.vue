<template>
  <div class="demo-col">
    <div class="demo-actions">
      <FlButton @click="isError = !isError">
        {{ isError ? '关闭错误状态' : '开启错误状态' }}
      </FlButton>
    </div>

    <FlSelect v-model="value" :is-error="isError" placeholder="请选择审批状态">
      <ElOption v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
    </FlSelect>

    <div class="demo-result">错误状态：{{ isError ? '开启' : '关闭' }}</div>
    <div class="demo-result">当前值：{{ value || '(空)' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isError = ref(false)
const value = ref('')
const options = [
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已驳回', value: 'rejected' }
]
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
