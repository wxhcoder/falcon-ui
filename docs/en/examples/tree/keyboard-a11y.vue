<template>
  <div class="demo-col">
    <FlTree
      :data="data"
      default-expand-all
      checkable
      :default-checked-keys="['view']"
      @node-click="latestEvent = `${$event.label} / node-click`"
      @check="handleCheck" />

    <div class="demo-result">Latest keyboard or mouse event:{{ latestEvent || '(none)' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { TreeCheckEvent, TreeCheckedKeys, TreeData } from '@falcon-ui/components'

const latestEvent = ref('')

const data: TreeData[] = [
  {
    key: 'access',
    label: 'Access control',
    children: [
      { key: 'view', label: 'View' },
      { key: 'edit', label: 'Edit' },
      { key: 'publish', label: 'Publish' }
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
