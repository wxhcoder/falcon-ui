<template>
  <div class="demo-col">
    <FlTree
      :data="data"
      accordion
      :default-expanded-keys="['workspace', 'docs']"
      @update:expanded-keys="expandedKeys = $event" />

    <div class="demo-result">展开 key：{{ expandedKeys.join(', ') || '(none)' }}</div>
    <div class="demo-result">展开同一父节点下的另一个分支时，原同级分支会自动收起。</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { TreeData, TreeKey } from '@falcon-ui/components'

const data: TreeData[] = [
  {
    key: 'workspace',
    label: '工作区',
    children: [
      {
        key: 'docs',
        label: '文档',
        children: [
          { key: 'guide', label: '指南' },
          { key: 'api', label: 'API' }
        ]
      },
      {
        key: 'packages',
        label: '包',
        children: [
          { key: 'components', label: '组件' },
          { key: 'theme', label: '主题' }
        ]
      },
      {
        key: 'playground',
        label: '演示',
        children: [{ key: 'examples', label: '示例' }]
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
