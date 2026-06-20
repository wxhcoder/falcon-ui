<template>
  <div class="demo-col">
    <FlTreeSelect v-model="value" :data="treeData" placeholder="请选择部门" style="width: 260px" />
    <div class="demo-result">当前值：{{ value || '(空)' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const value = ref('')
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
.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
