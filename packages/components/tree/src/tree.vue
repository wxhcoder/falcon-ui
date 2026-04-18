<template>
  <!-- 根节点在阶段 2 开始承接展开状态，并把切换能力下发给递归节点。 -->
  <div
    v-bind="attrs"
    :class="[rootClassName, resolvedClassNames.root]"
    :style="resolvedStyles.root"
    role="tree">
    <FlTreeNode
      v-for="node in treeIndex.nodes"
      :key="node.key"
      :node="node"
      :is-node-expanded="isNodeExpanded"
      :toggle-node-expansion="toggleNodeExpansion"
      :resolved-class-names="resolvedClassNames"
      :resolved-styles="resolvedStyles" />
  </div>
</template>

<script setup lang="ts">
import { useNamespace } from '@falcon-ui/utils'
import { computed, shallowRef, useAttrs, watch, type CSSProperties } from 'vue'
import {
  buildTreeIndex,
  collectInitiallyExpandedKeys,
  flTreeProps,
  resolveTreeSemanticRecord
} from './tree'
import type { FlTreeClassValue, FlTreeKey, FlTreeSemanticRecord } from './tree-types'
import FlTreeNode from './tree-node.vue'

defineOptions({
  name: 'FlTree',
  inheritAttrs: false
})

const props = defineProps(flTreeProps)
const attrs = useAttrs()
const ns = useNamespace('tree')
const rootClassName = ns.b()
// 用于存储当前展开状态的节点键集合。
const expandedKeySet = shallowRef(new Set<FlTreeKey>())

/**
 * 构建当前渲染所需的标准化树索引。
 */
const createTreeIndex = () => buildTreeIndex(props.data, props.props)

/**
 * 解析组件级语义化 classNames 配置。
 */
const createResolvedClassNames = () =>
  resolveTreeSemanticRecord(props.classNames, {
    componentProps: props
  })

/**
 * 解析组件级语义化 styles 配置。
 */
const createResolvedStyles = () =>
  resolveTreeSemanticRecord(props.styles, {
    componentProps: props
  })

const treeIndex = computed(createTreeIndex)
const resolvedClassNames =
  computed<FlTreeSemanticRecord<FlTreeClassValue>>(createResolvedClassNames)
const resolvedStyles = computed<FlTreeSemanticRecord<CSSProperties>>(createResolvedStyles)

/**
 * 根据当前树索引重建阶段 2 的默认展开状态。
 */
const syncExpandedKeysFromTreeIndex = () => {
  expandedKeySet.value = collectInitiallyExpandedKeys(treeIndex.value.nodes)
}

/**
 * 判断指定节点当前是否处于展开状态。
 */
const isNodeExpanded = (nodeKey: FlTreeKey) => expandedKeySet.value.has(nodeKey)

/**
 * 切换指定节点的展开状态。
 */
const toggleNodeExpansion = (nodeKey: FlTreeKey) => {
  const nextExpandedKeys = new Set(expandedKeySet.value)

  if (nextExpandedKeys.has(nodeKey)) {
    nextExpandedKeys.delete(nodeKey)
  } else {
    nextExpandedKeys.add(nodeKey)
  }

  expandedKeySet.value = nextExpandedKeys
}

watch(treeIndex, syncExpandedKeysFromTreeIndex, { immediate: true })
</script>
