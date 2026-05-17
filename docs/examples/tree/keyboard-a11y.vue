<template>
  <div class="demo-col">
    <FlTree
      :data="data"
      default-expand-all
      checkable
      :default-checked-keys="['view']"
      @node-click="latestEvent = `${$event.label} / node-click`"
      @check="handleCheck" />

    <div class="demo-result">最近键盘或鼠标事件：{{ latestEvent || '(none)' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { TreeCheckEvent, TreeCheckedKeys, TreeData } from '@falcon-ui/components'

const latestEvent = ref('')

const data: TreeData[] = [
  {
    key: 'access',
    label: '访问控制',
    children: [
      { key: 'view', label: '查看' },
      { key: 'edit', label: '编辑' },
      { key: 'publish', label: '发布' }
    ]
  }
]

const handleCheck = (_keys: TreeCheckedKeys, event: TreeCheckEvent) => {
  latestEvent.value = `${event.node.label} / ${event.event.type}`
}
</script>

<style scoped>
.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
