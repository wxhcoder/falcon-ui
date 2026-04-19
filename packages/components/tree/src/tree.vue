<template>
  <!-- 根节点在阶段 3 起仅负责接入展开状态层，并把渲染能力下发给递归节点。 -->
  <div
    v-bind="attrs"
    :class="[rootClassName, resolvedClassNames.root]"
    :style="resolvedStyles.root"
    role="tree">
    <FlTreeNode
      v-for="node in treeIndex.nodes"
      :key="node.key"
      :node="node"
      :emit-node-click="emitNodeClick"
      :is-node-expanded="isNodeExpanded"
      :toggle-node-expansion="toggleNodeExpansion"
      :resolved-class-names="resolvedClassNames"
      :resolved-styles="resolvedStyles" />
  </div>
</template>

<script setup lang="ts">
import { useNamespace } from '@falcon-ui/utils'
import { computed, useAttrs, type CSSProperties } from 'vue'
import {
  buildTreeIndex,
  createTreeEventNode,
  resolveTreeSemanticRecord,
  treeEmits,
  treeProps,
  type TreeClassValue,
  type TreeNodeInstance,
  type TreeNodeModel,
  type TreeSemanticRecord
} from './tree'
import FlTreeNode from './tree-node.vue'
import { useTreeExpandedState, type TreeExpandedStateEmit } from './use-tree-expanded-state'

defineOptions({
  name: 'FlTree',
  inheritAttrs: false
})

const props = defineProps(treeProps)
const emit = defineEmits(treeEmits)
const attrs = useAttrs()
const ns = useNamespace('tree')
const rootClassName = ns.b()

/**
 * 构建当前渲染所需的标准化树索引。
 */
const createCurrentTreeIndex = () => buildTreeIndex(props.data, props.props)

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

const treeIndex = computed(createCurrentTreeIndex)
const resolvedClassNames = computed<TreeSemanticRecord<TreeClassValue>>(createResolvedClassNames)
const resolvedStyles = computed<TreeSemanticRecord<CSSProperties>>(createResolvedStyles)

/**
 * 统一派发节点点击事件。`node-click` 不暴露 `expanded` 字段。
 */
const emitNodeClick = ({
  node,
  component,
  event
}: {
  node: TreeNodeModel
  component: TreeNodeInstance
  event: MouseEvent
}) => {
  emit('node-click', node.data, createTreeEventNode({ node }), component, event)
}

const { isNodeExpanded, toggleNodeExpansion } = useTreeExpandedState({
  props,
  treeIndex,
  emit: emit as TreeExpandedStateEmit
})
</script>
