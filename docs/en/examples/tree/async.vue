<template>
  <div class="demo-col">
    <div class="demo-toolbar">
      <FlButton size="small" @click="reset">ResetText</FlButton>
      <el-switch v-model="controlledLoaded" active-text="Controlled loadedKeys" />
    </div>

    <FlTree
      :data="data"
      :load-data="loadData"
      :loaded-keys="controlledLoaded ? loadedKeys : undefined"
      @update:loaded-keys="handleLoadedKeysChange"
      @load="handleLoad" />

    <div class="demo-result">loadedKeys:{{ loadedKeys.join(', ') || '(none)' }}</div>
    <div class="demo-result">Latest load:{{ latestLoad || '(none)' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { TreeData, TreeKey, TreeLoadEvent, TreeNode } from '@falcon-ui/components'

const createData = (): TreeData[] => [
  {
    key: 'remote-root',
    label: 'Remote organization'
  },
  {
    key: 'local',
    label: 'Local node',
    isLeaf: true
  }
]

const data = ref<TreeData[]>(createData())
const loadedKeys = ref<TreeKey[]>([])
const latestLoad = ref('')
const controlledLoaded = ref(false)

const replaceChildren = (nodes: TreeData[], key: TreeKey, children: TreeData[]): TreeData[] =>
  nodes.map((node) => {
    if (node.key === key) {
      return {
        ...node,
        children
      }
    }

    if (Array.isArray(node.children)) {
      return {
        ...node,
        children: replaceChildren(node.children, key, children)
      }
    }

    return node
  })

const reset = () => {
  data.value = createData()
  loadedKeys.value = []
  latestLoad.value = ''
}

const loadData = async (node: TreeNode) => {
  await new Promise((resolve) => window.setTimeout(resolve, 300))

  data.value = replaceChildren(data.value, node.key, [
    { key: `${String(node.key)}-member-a`, label: 'Member A', isLeaf: true },
    { key: `${String(node.key)}-member-b`, label: 'Member B', isLeaf: true }
  ])
}

const handleLoadedKeysChange = (keys: TreeKey[]) => {
  loadedKeys.value = keys
}

const handleLoad = (_keys: TreeKey[], event: TreeLoadEvent) => {
  latestLoad.value = `${event.node.label} loaded`
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
