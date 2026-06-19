<template>
  <div class="demo-col">
    <div class="demo-toolbar">
      <el-switch v-model="active" active-text="EnabledText" />
    </div>

    <FlTree
      :data="data"
      default-expand-all
      :class-names="active ? classNames : undefined"
      :node-class-name="active ? nodeClassName : undefined"
      :styles="active ? styles : undefined" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { TreeClassNames, TreeData, TreeNodeClassName, TreeStyles } from '@falcon-ui/components'

interface StyledTreeData extends TreeData {
  kind?: 'section' | 'token'
  status?: 'new'
  children?: StyledTreeData[]
}

const active = ref(true)

const data: StyledTreeData[] = [
  {
    key: 'semantic',
    label: 'Semantic DOM',
    kind: 'section',
    children: [
      { key: 'root', label: 'root hook', kind: 'token' },
      { key: 'item', label: 'item hook', kind: 'token', status: 'new' }
    ]
  }
]

const classNames: TreeClassNames = ({ props }) => ({
  root: props.showLine ? 'docs-tree-root docs-tree-root--line' : 'docs-tree-root',
  item: 'docs-tree-item'
})

const nodeClassName: TreeNodeClassName = ({ node, data }) => ({
  'docs-tree-node--section': node.key === 'semantic',
  'docs-tree-node--token': data.kind === 'token',
  'docs-tree-node--new': data.status === 'new'
})

const styles: TreeStyles = {
  item: {
    marginBlock: '2px'
  }
}
</script>

<style scoped>
.demo-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

:deep(.docs-tree-root) {
  padding: 8px;
  border: 1px solid var(--el-border-color);
  border-radius: var(--fl-radius-base);
}

:deep(.docs-tree-item > .fl-tree__item-content) {
  border-radius: var(--fl-radius-base);
}

:deep(.docs-tree-node--section > .fl-tree__item-content .fl-tree__item-title) {
  font-weight: 600;
}

:deep(.docs-tree-node--token > .fl-tree__item-content) {
  padding-inline-end: 8px;
}

:deep(.docs-tree-node--new > .fl-tree__item-content .fl-tree__item-title) {
  color: var(--el-color-success);
}
</style>
