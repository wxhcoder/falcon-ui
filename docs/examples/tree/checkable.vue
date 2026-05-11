<template>
  <div class="demo-col">
    <div class="demo-toolbar">
      <el-switch v-model="checkStrictly" active-text="严格勾选" inactive-text="父子联动" />
      <FlButton size="small" @click="resetChecked">重置</FlButton>
    </div>

    <FlTree
      :data="data"
      default-expand-all
      checkable
      :check-strictly="checkStrictly"
      :checked-keys="checkedKeys"
      @update:checked-keys="checkedKeys = $event"
      @check="handleCheck" />

    <div class="demo-result">已勾选：{{ checkedText }}</div>
    <div class="demo-result">半选：{{ halfCheckedText }}</div>
    <div class="demo-result">最近事件：{{ latestCheck || '(none)' }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { TreeCheckEvent, TreeCheckedKeys, TreeData, TreeKey } from '@falcon-ui/components'

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
          { key: 'dashboard-edit', label: '编辑', disableCheckbox: true }
        ]
      },
      {
        key: 'system',
        label: '系统',
        disabled: true,
        children: [{ key: 'system-audit', label: '审计' }]
      },
      { key: 'hidden-checkbox', label: '隐藏复选框', checkable: false }
    ]
  }
]

const checkStrictly = ref(false)
const checkedKeys = ref<TreeCheckedKeys>(['dashboard-view'])
const latestCheck = ref('')

const checkedText = computed(() => {
  const keys = Array.isArray(checkedKeys.value) ? checkedKeys.value : checkedKeys.value.checked

  return keys.join(', ') || '(none)'
})

const halfCheckedText = computed(() => {
  const keys = Array.isArray(checkedKeys.value) ? [] : checkedKeys.value.halfChecked

  return keys.join(', ') || '(none)'
})

watch(checkStrictly, () => {
  resetChecked()
})

const resetChecked = () => {
  checkedKeys.value = checkStrictly.value ? { checked: [], halfChecked: [] } : []
}

const handleCheck = (keys: TreeCheckedKeys, event: TreeCheckEvent) => {
  const checked = Array.isArray(keys) ? keys : keys.checked
  const halfChecked: TreeKey[] = Array.isArray(keys) ? event.halfCheckedKeys : keys.halfChecked

  latestCheck.value = `${String(event.key)} ${event.checked ? '勾选' : '取消'}，checked=${
    checked.join(', ') || '(none)'
  }，half=${halfChecked.join(', ') || '(none)'}`
}
</script>

<style scoped>
.demo-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
