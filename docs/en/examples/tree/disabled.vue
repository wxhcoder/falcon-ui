<template>
  <div class="demo-col">
    <FlTree
      :data="data"
      default-expand-all
      checkable
      :selected-keys="selectedKeys"
      :checked-keys="checkedKeys"
      :disabled-keys="disabledKeys"
      :unselectable-keys="unselectableKeys"
      :disabled-checkbox-keys="disabledCheckboxKeys"
      :hidden-checkbox-keys="hiddenCheckboxKeys"
      @node-click="handleNodeClick"
      @update:selected-keys="selectedKeys = $event"
      @update:checked-keys="checkedKeys = $event"
      @select="handleSelect"
      @check="handleCheck"
      @right-click="handleRightClick" />

    <div class="demo-result">Current selection:{{ selectedKeys.join(', ') || '(none)' }}</div>
    <div class="demo-result">Current checked:{{ checkedText }}</div>
    <div class="demo-result">Latest click:{{ latestClick || '(none)' }}</div>
    <div class="demo-result">Latest selection:{{ latestSelect || '(none)' }}</div>
    <div class="demo-result">Latest checked:{{ latestCheck || '(none)' }}</div>
    <div class="demo-result">Latest right click:{{ latestRightClick || '(none)' }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type {
  TreeCheckEvent,
  TreeCheckedKeys,
  TreeData,
  TreeKey,
  TreeNode,
  TreeNodeInstance,
  TreeSelectEvent
} from '@falcon-ui/components'

const data: TreeData[] = [
  {
    key: 'permission',
    label: 'Permissions',
    children: [
      {
        key: 'dashboard',
        label: 'Dashboard',
        children: [
          { key: 'dashboard-view', label: 'View' },
          { key: 'dashboard-edit', label: 'Edit (checkbox disabled)' },
          { key: 'dashboard-ops', label: 'Ops entry (checkbox hidden)' }
        ]
      },
      {
        key: 'group-header',
        label: 'Group title (unselectable)',
        children: [{ key: 'group-member', label: 'Group member' }]
      },
      {
        key: 'system',
        label: 'System (disabled)',
        children: [{ key: 'system-audit', label: 'Audit log' }]
      }
    ]
  }
]

const disabledKeys: TreeKey[] = ['system']
const unselectableKeys: TreeKey[] = ['group-header']
const disabledCheckboxKeys: TreeKey[] = ['dashboard-edit']
const hiddenCheckboxKeys: TreeKey[] = ['dashboard-ops']

const selectedKeys = ref<TreeKey[]>(['dashboard-view'])
const checkedKeys = ref<TreeCheckedKeys>(['system', 'dashboard-view'])
const latestClick = ref('')
const latestSelect = ref('')
const latestCheck = ref('')
const latestRightClick = ref('')

const checkedText = computed(() => {
  const keys = Array.isArray(checkedKeys.value) ? checkedKeys.value : checkedKeys.value.checked

  return keys.join(', ') || '(none)'
})

const handleNodeClick = (
  _data: TreeData,
  node: TreeNode,
  _component: TreeNodeInstance,
  event: Event
) => {
  latestClick.value = `${node.label} / ${event.type}`
}

const handleSelect = (keys: TreeKey[], event: TreeSelectEvent) => {
  latestSelect.value = `${String(event.key)} ${event.selected ? 'selected' : 'unchecked'},result:${
    keys.join(', ') || '(none)'
  }`
}

const handleCheck = (keys: TreeCheckedKeys, event: TreeCheckEvent) => {
  const checked = Array.isArray(keys) ? keys : keys.checked

  latestCheck.value = `${String(event.key)} ${event.checked ? 'checked' : 'unchecked'},result:${
    checked.join(', ') || '(none)'
  }`
}

const handleRightClick = (
  _data: TreeData,
  node: TreeNode,
  _component: TreeNodeInstance,
  event: MouseEvent
) => {
  latestRightClick.value = `${node.label} / ${event.type}`
}
</script>

<style scoped>
.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
