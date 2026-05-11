<template>
  <div class="demo-col">
    <div class="demo-toolbar">
      <span class="demo-toolbar__label">切换图标</span>
      <el-select v-model="switcherIcon" size="small" style="width: 150px">
        <el-option label="arrow" value="arrow" />
        <el-option label="plus-minus" value="plus-minus" />
        <el-option label="folder" value="folder" />
      </el-select>
      <el-switch v-model="showLeafIcon" active-text="叶子图标" />
    </div>

    <FlTree
      :data="data"
      default-expand-all
      :show-line="{ showLeafIcon }"
      :switcher-icon="switcherIcon">
      <template #default="{ node, data: raw }">
        <span class="node-title">
          <span>{{ node.label }}</span>
          <el-tag v-if="raw.status" size="small" effect="plain">{{ raw.status }}</el-tag>
        </span>
      </template>
    </FlTree>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { TreeData, TreeSwitcherIconMode } from '@falcon-ui/components'

const switcherIcon = ref<TreeSwitcherIconMode>('arrow')
const showLeafIcon = ref(false)

const data: TreeData[] = [
  {
    key: 'library',
    label: '组件库',
    status: 'root',
    children: [
      {
        key: 'display',
        label: '数据展示',
        status: 'group',
        children: [
          { key: 'tree', label: 'Tree', status: 'new' },
          { key: 'table', label: 'Table' }
        ]
      },
      {
        key: 'input',
        label: '表单输入',
        children: [{ key: 'select', label: 'Select' }]
      }
    ]
  }
]
</script>

<style scoped>
.demo-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.demo-toolbar__label {
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.node-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
</style>
