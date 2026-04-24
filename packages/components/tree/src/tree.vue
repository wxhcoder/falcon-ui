<template>
  <!-- 根节点在阶段 4 起同时接入展开与单选状态层，并把渲染能力下发给递归节点。 -->
  <div
    v-bind="attrs"
    :class="[rootClassName, resolvedClassNames.root]"
    :style="resolvedStyles.root"
    role="tree">
    <FlTreeNode
      v-for="node in treeIndex.nodes"
      :key="node.key"
      :node="node"
      :on-node-content-click="handleNodeContentClick"
      :is-node-expanded="isNodeExpanded"
      :is-node-checked="isNodeChecked"
      :is-node-selected="isNodeSelected"
      :tree-checkable="isTreeCheckable"
      :strictly-checkable="isStrictlyCheckable"
      :tree-selectable="isTreeSelectable"
      :is-checkbox-disabled="isCheckboxDisabled"
      :toggle-node-checked="toggleCheckedNode"
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
import { useTreeCheckedState, type TreeCheckedStateEmit } from './use-tree-checked-state'
import { useTreeExpandedState, type TreeExpandedStateEmit } from './use-tree-expanded-state'
import { useTreeSelectedState, type TreeSelectedStateEmit } from './use-tree-selected-state'

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

const { isNodeSelected, isTreeSelectable, selectNode } = useTreeSelectedState({
  props,
  treeIndex,
  emit: emit as TreeSelectedStateEmit
})

const {
  isCheckboxDisabled,
  isNodeChecked,
  isStrictlyCheckable,
  isTreeCheckable,
  toggleCheckedNode
} = useTreeCheckedState({
  props,
  treeIndex,
  emit: emit as TreeCheckedStateEmit
})

/**
 * 节点内容区点击时先派发 `node-click`，再进入阶段 4 的单选链路。
 */
const handleNodeContentClick = ({
  node,
  component,
  event
}: {
  node: TreeNodeModel
  component: TreeNodeInstance
  event: MouseEvent
}) => {
  emitNodeClick({
    node,
    component,
    event
  })
  selectNode({
    node,
    event
  })
}
</script>
