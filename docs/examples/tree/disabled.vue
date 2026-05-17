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

    <div class="demo-result">当前选中：{{ selectedKeys.join(', ') || '(none)' }}</div>
    <div class="demo-result">当前勾选：{{ checkedText }}</div>
    <div class="demo-result">最近点击：{{ latestClick || '(none)' }}</div>
    <div class="demo-result">最近选择：{{ latestSelect || '(none)' }}</div>
    <div class="demo-result">最近勾选：{{ latestCheck || '(none)' }}</div>
    <div class="demo-result">最近右键：{{ latestRightClick || '(none)' }}</div>
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
    label: '权限',
    children: [
      {
        key: 'dashboard',
        label: '仪表盘',
        children: [
          { key: 'dashboard-view', label: '查看' },
          { key: 'dashboard-edit', label: '编辑（checkbox 禁用）' },
          { key: 'dashboard-ops', label: '运维入口（checkbox 隐藏）' }
        ]
      },
      {
        key: 'group-header',
        label: '分组标题（不可选）',
        children: [{ key: 'group-member', label: '分组成员' }]
      },
      {
        key: 'system',
        label: '系统（禁用）',
        children: [{ key: 'system-audit', label: '审计日志' }]
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
  latestSelect.value = `${String(event.key)} ${event.selected ? '选中' : '取消'}，结果：${
    keys.join(', ') || '(none)'
  }`
}

const handleCheck = (keys: TreeCheckedKeys, event: TreeCheckEvent) => {
  const checked = Array.isArray(keys) ? keys : keys.checked

  latestCheck.value = `${String(event.key)} ${event.checked ? '勾选' : '取消'}，结果：${
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
