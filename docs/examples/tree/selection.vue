<template>
  <div class="demo-col">
    <div class="demo-toolbar">
      <el-switch v-model="multiple" active-text="多选" inactive-text="单选" />
      <FlButton size="small" @click="selectedKeys = []">清空选择</FlButton>
    </div>

    <FlTree
      :data="data"
      default-expand-all
      :multiple="multiple"
      :selected-keys="selectedKeys"
      @update:selected-keys="selectedKeys = $event"
      @select="handleSelect"
      @right-click="handleRightClick" />

    <div class="demo-result">当前选中：{{ selectedKeys.join(', ') || '(none)' }}</div>
    <div class="demo-result">最近选择：{{ latestSelect || '(none)' }}</div>
    <div class="demo-result">最近右键：{{ latestRightClick || '(none)' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type {
  TreeData,
  TreeKey,
  TreeNode,
  TreeNodeInstance,
  TreeSelectEvent
} from '@falcon-ui/components'

const data: TreeData[] = [
  {
    key: 'falcon',
    label: 'Falcon UI',
    children: [
      { key: 'button', label: 'Button' },
      { key: 'tree', label: 'Tree' },
      { key: 'legacy', label: 'Legacy', selectable: false },
      { key: 'disabled', label: 'Disabled', disabled: true }
    ]
  }
]

const multiple = ref(false)
const selectedKeys = ref<TreeKey[]>([])
const latestSelect = ref('')
const latestRightClick = ref('')

watch(multiple, () => {
  selectedKeys.value = []
})

const handleSelect = (keys: TreeKey[], event: TreeSelectEvent) => {
  latestSelect.value = `${String(event.key)} ${event.selected ? '选中' : '取消'}，结果：${
    keys.join(', ') || '(none)'
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
