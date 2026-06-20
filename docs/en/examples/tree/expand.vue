<template>
  <div class="demo-col">
    <div class="demo-group">
      <div class="demo-group__title">Default expansion</div>
      <FlTree :data="data" :default-expanded-keys="['guide']" />
    </div>

    <div class="demo-group">
      <div class="demo-group__title">Controlled expansion</div>
      <div class="demo-toolbar">
        <FlButton size="small" @click="expandedKeys = allExpandableKeys">Expand all</FlButton>
        <FlButton size="small" @click="expandedKeys = []">Collapse all</FlButton>
        <el-switch v-model="autoExpandParent" active-text="Auto expand parents" />
      </div>

      <FlTree
        :data="data"
        :expanded-keys="expandedKeys"
        :auto-expand-parent="autoExpandParent"
        @update:expanded-keys="expandedKeys = $event"
        @expand="handleExpand" />

      <div class="demo-result">Expanded keys:{{ expandedKeys.join(', ') || '(none)' }}</div>
      <div class="demo-result">Latest expand event:{{ latestExpand || '(none)' }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { TreeData, TreeExpandEvent, TreeKey } from '@falcon-ui/components'

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
        children: [{ key: 'components', label: 'Components' }]
      }
    ]
  }
]

const allExpandableKeys: TreeKey[] = ['workspace', 'docs', 'packages']
const expandedKeys = ref<TreeKey[]>(['workspace'])
const autoExpandParent = ref(true)
const latestExpand = ref('')

const handleExpand = (payload: TreeExpandEvent) => {
  latestExpand.value = `${String(payload.key)} -> ${payload.expanded ? 'expanded' : 'collapsed'}`
}
</script>

<style scoped>
.demo-group + .demo-group {
  margin-top: 18px;
}

.demo-group__title {
  margin-bottom: 8px;
  color: var(--vp-c-text-1);
  font-weight: 600;
  font-size: 14px;
}

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
