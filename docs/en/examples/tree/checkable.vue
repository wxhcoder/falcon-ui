<template>
  <div class="demo-col">
    <div class="demo-toolbar">
      <el-switch
        v-model="checkStrictly"
        active-text="Strict checking"
        inactive-text="Parent-child conduct" />
      <FlButton size="small" @click="resetChecked">Reset</FlButton>
    </div>

    <FlTree
      :data="data"
      default-expand-all
      checkable
      :check-strictly="checkStrictly"
      :checked-keys="checkedKeys"
      @update:checked-keys="checkedKeys = $event"
      @check="handleCheck" />

    <div class="demo-result">Checked:{{ checkedText }}</div>
    <div class="demo-result">Half checked:{{ halfCheckedText }}</div>
    <div class="demo-result">Latest event:{{ latestCheck || '(none)' }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { TreeCheckEvent, TreeCheckedKeys, TreeData, TreeKey } from '@falcon-ui/components'

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
          { key: 'dashboard-edit', label: 'Edit' },
          { key: 'dashboard-publish', label: 'Publish' }
        ]
      },
      {
        key: 'system',
        label: 'System',
        children: [{ key: 'system-audit', label: 'Audit' }]
      }
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

  latestCheck.value = `${String(event.key)} ${event.checked ? 'checked' : 'unchecked'},checked=${
    checked.join(', ') || '(none)'
  },half=${halfChecked.join(', ') || '(none)'}`
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
