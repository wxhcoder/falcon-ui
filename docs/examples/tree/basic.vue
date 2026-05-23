<template>
  <div class="demo-col">
    <FlTree :data="data" :props="fieldProps" default-expand-all />
    <div class="demo-result">当前数据使用 name / items 字段映射。</div>
  </div>
</template>

<script setup lang="ts">
import type { TreeData, TreeNodeProps } from '@falcon-ui/components'

const fieldProps: TreeNodeProps = {
  label: 'name',
  children: 'items'
}

const data = [
  {
    key: 'workspace',
    name: '工作区',
    items: [
      {
        key: 'design',
        name: '设计资源',
        items: [
          { key: 'icons', name: '图标' },
          { key: 'tokens', name: '变量' }
        ]
      },
      {
        key: 'engineering',
        name: '工程资源',
        items: [{ key: 'components', name: '组件' }]
      }
    ]
  }
] as TreeData[]
</script>

<style scoped>
.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
