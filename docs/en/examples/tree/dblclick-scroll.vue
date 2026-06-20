<template>
  <div class="demo-col">
    <div class="demo-toolbar">
      <FlInput v-model="keyword" size="small" placeholder="Filter nodes" style="width: 180px" />
      <FlButton size="small" @click="scrollToNode('table')">Locate Table</FlButton>
      <FlButton size="small" @click="scrollToNode('missing')">Locate missing key</FlButton>
    </div>

    <div class="scroll-host">
      <FlTree
        ref="treeRef"
        :data="data"
        :default-expanded-keys="['components']"
        :filter-tree-node="filterTreeNode"
        @dblclick="handleDblclick" />
    </div>

    <div class="demo-result">Latest double click:{{ latestDblclick || '(none)' }}</div>
    <div class="demo-result">Latest scroll:{{ latestScroll || '(none)' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type {
  TreeData,
  TreeExpose,
  TreeFilterTreeNode,
  TreeKey,
  TreeNode
} from '@falcon-ui/components'

const treeRef = ref<TreeExpose | null>(null)
const keyword = ref('table')
const latestDblclick = ref('')
const latestScroll = ref('')

const data: TreeData[] = [
  {
    key: 'components',
    label: 'Components',
    children: [
      {
        key: 'data-display',
        label: 'Data display',
        children: [
          { key: 'tree', label: 'Tree' },
          { key: 'table', label: 'Table' },
          { key: 'qr-code', label: 'QrCode' },
          { key: 'barcode', label: 'Barcode' }
        ]
      },
      {
        key: 'form',
        label: 'Form',
        children: [
          { key: 'input', label: 'Input' },
          { key: 'select', label: 'Select' },
          { key: 'date-picker', label: 'DatePicker' },
          { key: 'input-number', label: 'InputNumber' }
        ]
      }
    ]
  }
]

const filterTreeNode: TreeFilterTreeNode = (node) => {
  const normalizedKeyword = keyword.value.trim().toLowerCase()

  return normalizedKeyword.length > 0 && node.label.toLowerCase().includes(normalizedKeyword)
}

const scrollToNode = (key: TreeKey) => {
  treeRef.value?.scrollTo({
    key,
    align: 'top',
    offset: 8
  })
  latestScroll.value = String(key)
}

const handleDblclick = (_data: TreeData, node: TreeNode) => {
  latestDblclick.value = node.label
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

.scroll-host {
  max-height: 180px;
  overflow: auto;
  border: 1px solid var(--el-border-color);
  border-radius: var(--fl-radius-base);
  padding: 8px;
}

.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
