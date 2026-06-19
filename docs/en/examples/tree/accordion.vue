<template>
  <div class="demo-col">
    <FlTree
      :data="data"
      accordion
      :default-expanded-keys="['workspace', 'docs']"
      @update:expanded-keys="expandedKeys = $event" />

    <div class="demo-result">Expanded keys:{{ expandedKeys.join(', ') || '(none)' }}</div>
    <div class="demo-result">
      Expanding another branch under the same parent automatically collapses the previous sibling
      branch.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { TreeData, TreeKey } from '@falcon-ui/components'

const data: TreeData[] = [
  {
    key: 'workspace',
    label: 'Workspace',
    children: [
      {
        key: 'docs',
        label: 'Docs',
        children: [
          { key: 'guide', label: 'Guide' },
          { key: 'api', label: 'API' }
        ]
      },
      {
        key: 'packages',
        label: 'Packages',
        children: [
          { key: 'components', label: 'Components' },
          { key: 'theme', label: 'Theme' }
        ]
      },
      {
        key: 'playground',
        label: 'Demos',
        children: [{ key: 'examples', label: 'Examples' }]
      }
    ]
  }
]

const expandedKeys = ref<TreeKey[]>(['workspace', 'docs'])
</script>

<style scoped>
.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
