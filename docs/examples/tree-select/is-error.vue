<template>
  <div class="demo-col">
    <div class="demo-actions">
      <FlButton @click="isError = !isError">
        {{ isError ? '关闭错误状态' : '开启错误状态' }}
      </FlButton>
    </div>

    <FlTreeSelect
      v-model="value"
      :data="treeData"
      :is-error="isError"
      placeholder="请选择部门"
      style="width: 260px" />

    <div class="demo-result">错误状态：{{ isError ? '开启，值已清空' : '关闭' }}</div>
    <div class="demo-result">当前值：{{ value || '(空)' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isError = ref(false)
const value = ref('frontend')
const treeData = [
  {
    value: 'engineering',
    label: '工程部',
    children: [
      { value: 'frontend', label: '前端组' },
      { value: 'backend', label: '后端组' }
    ]
  },
  {
    value: 'design',
    label: '设计部'
  }
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
