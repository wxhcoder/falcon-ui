<template>
  <div class="demo-col">
    <FlTree
      :data="data"
      default-expand-all
      draggable
      :allow-drag="allowDrag"
      :allow-drop="allowDrop"
      @node-drag-start="appendLog('drag-start', $event.label)"
      @node-drop="handleDrop" />

    <div class="demo-result">拖拽日志：{{ latestLog || '(none)' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type {
  TreeAllowDrag,
  TreeAllowDrop,
  TreeData,
  TreeNode,
  TreeNodeDropType
} from '@falcon-ui/components'

const data = ref<TreeData[]>([
  {
    key: 'workbench',
    label: '工作台',
    children: [
      { key: 'overview', label: '总览' },
      { key: 'reports', label: '报表' }
    ]
  },
  {
    key: 'archive',
    label: '归档',
    children: [{ key: 'readonly', label: '只读节点' }]
  }
])

const latestLog = ref('')

const allowDrag: TreeAllowDrag = (node) => node.key !== 'archive'
const allowDrop: TreeAllowDrop = (_draggingNode, dropNode, type) =>
  dropNode.key !== 'archive' || type !== 'inner'

const appendLog = (type: string, label: string) => {
  latestLog.value = `${type}: ${label}`
}

const handleDrop = (
  draggingNode: TreeNode,
  dropNode: TreeNode,
  dropType: Exclude<TreeNodeDropType, 'none'>
) => {
  latestLog.value = `${draggingNode.label} -> ${dropNode.label} (${dropType})`
}
</script>

<style scoped>
.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
