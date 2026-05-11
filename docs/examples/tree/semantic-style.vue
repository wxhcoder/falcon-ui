<template>
  <div class="demo-col">
    <div class="demo-toolbar">
      <el-switch v-model="active" active-text="启用语义化样式" />
    </div>

    <FlTree
      :data="data"
      default-expand-all
      :class-names="active ? classNames : undefined"
      :styles="active ? styles : undefined" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { TreeClassNames, TreeData, TreeStyles } from '@falcon-ui/components'

const active = ref(true)

const data: TreeData[] = [
  {
    key: 'semantic',
    label: '语义化 DOM',
    children: [
      { key: 'root', label: 'root 挂点' },
      { key: 'item', label: 'item 挂点' }
    ]
  }
]

const classNames: TreeClassNames = ({ props }) => ({
  root: props.showLine ? 'docs-tree-root docs-tree-root--line' : 'docs-tree-root',
  item: 'docs-tree-item'
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
</style>
