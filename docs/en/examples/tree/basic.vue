<template>
  <div class="demo-col">
    <FlTree :data="data" :props="fieldProps" default-expand-all />
    <div class="demo-result">The current data uses name / items field mapping.</div>
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
    name: 'Workspace',
    items: [
      {
        key: 'design',
        name: 'Design assets',
        items: [
          { key: 'icons', name: 'Icons' },
          { key: 'tokens', name: 'Tokens' }
        ]
      },
      {
        key: 'engineering',
        name: 'Engineering assets',
        items: [{ key: 'components', name: 'Components' }]
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
