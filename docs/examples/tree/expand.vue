<template>
  <div class="demo-col">
    <div class="demo-toolbar">
      <FlButton size="small" @click="expandedKeys = allExpandableKeys">全部展开</FlButton>
      <FlButton size="small" @click="expandedKeys = []">全部收起</FlButton>
      <el-switch v-model="autoExpandParent" active-text="自动展开父级" />
    </div>

    <FlTree
      :data="data"
      :expanded-keys="expandedKeys"
      :auto-expand-parent="autoExpandParent"
      :default-expanded-keys="['workspace']"
      @update:expanded-keys="expandedKeys = $event"
      @expand="handleExpand" />

    <div class="demo-result">展开 key：{{ expandedKeys.join(', ') || '(none)' }}</div>
    <div class="demo-result">最近展开事件：{{ latestExpand || '(none)' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { TreeData, TreeExpandPayload, TreeKey } from '@falcon-ui/components'

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
        children: [{ key: 'components', label: '组件' }]
      }
    ]
  }
]

const allExpandableKeys: TreeKey[] = ['workspace', 'docs', 'packages']
const expandedKeys = ref<TreeKey[]>(['workspace'])
const autoExpandParent = ref(true)
const latestExpand = ref('')

const handleExpand = (payload: TreeExpandPayload) => {
  latestExpand.value = `${String(payload.key)} -> ${payload.expanded ? '展开' : '收起'}`
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
