<template>
  <!-- 根节点在阶段 1 只负责只读渲染骨架。 -->
  <div
    v-bind="attrs"
    :class="[rootClassName, resolvedClassNames.root]"
    :style="resolvedStyles.root"
    role="tree">
    <FlTreeNode
      v-for="node in treeIndex.nodes"
      :key="node.key"
      :node="node"
      :resolved-class-names="resolvedClassNames"
      :resolved-styles="resolvedStyles" />
  </div>
</template>

<script setup lang="ts">
import { useNamespace } from '@falcon-ui/utils'
import { computed, useAttrs, type CSSProperties } from 'vue'
import { buildTreeIndex, flTreeProps, resolveTreeSemanticRecord } from './tree'
import type { FlTreeClassValue, FlTreeSemanticRecord } from './tree-types'
import FlTreeNode from './tree-node.vue'

defineOptions({
  name: 'FlTree',
  inheritAttrs: false
})

const props = defineProps(flTreeProps)
const attrs = useAttrs()
const ns = useNamespace('tree')
const rootClassName = ns.b()

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
</script>
