<template>
  <div class="demo-col">
    <FlTreeSelect
      v-model="defaultClearableValue"
      :data="treeData"
      placeholder="默认 clearable=true"
      style="width: 260px" />
    <FlTreeSelect
      v-model="disabledClearableValue"
      :clearable="false"
      :data="treeData"
      placeholder="显式关闭 clearable"
      style="width: 260px" />
    <div class="demo-result">
      默认值：{{ defaultClearableValue || '(空)' }}，关闭清空值：{{
        disabledClearableValue || '(空)'
      }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const defaultClearableValue = ref('frontend')
const disabledClearableValue = ref('backend')
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
