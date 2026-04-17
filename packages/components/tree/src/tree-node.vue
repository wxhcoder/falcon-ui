<template>
  <!-- 阶段 1 保持整棵树默认展开，只渲染稳定的节点骨架。 -->
  <div
    :class="[itemClassName, semanticClassNames.item, node.className]"
    :style="[semanticStyles.item, itemStyle]"
    role="treeitem"
    :aria-level="node.level">
    <div :class="itemContentClassName">
      <span
        :class="[itemIconClassName, semanticClassNames.itemIcon]"
        :style="semanticStyles.itemIcon">
        <span v-if="isLeafNode" :class="switcherDotClassName" aria-hidden="true" />
        <ElIcon v-else :class="switcherIconClassName" aria-hidden="true">
          <CaretBottom />
        </ElIcon>
      </span>
      <span
        :class="[itemTitleClassName, semanticClassNames.itemTitle]"
        :style="semanticStyles.itemTitle">
        {{ node.label }}
      </span>
    </div>
    <div v-if="node.children.length > 0" :class="childrenClassName" role="group">
      <FlTreeNode
        v-for="childNode in node.children"
        :key="childNode.key"
        :node="childNode"
        :resolved-class-names="resolvedClassNames"
        :resolved-styles="resolvedStyles" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { CaretBottom } from '@element-plus/icons-vue'
import { ElIcon } from 'element-plus'
import { useNamespace } from '@falcon-ui/utils'
import { computed, type CSSProperties } from 'vue'
import type { FlTreeClassValue, FlTreeNormalizedNode, FlTreeSemanticRecord } from './tree-types'

defineOptions({
  name: 'FlTreeNode'
})

/**
 * 内部节点组件仅接收标准化节点和已解析完成的语义化样式挂点。
 */
interface TreeNodeProps {
  node: FlTreeNormalizedNode
  resolvedClassNames: FlTreeSemanticRecord<FlTreeClassValue>
  resolvedStyles: FlTreeSemanticRecord<CSSProperties>
}

const props = defineProps<TreeNodeProps>()
const ns = useNamespace('tree')
const itemClassName = ns.e('item')
const itemContentClassName = ns.e('item-content')
const itemIconClassName = ns.e('item-icon')
const switcherDotClassName = ns.e('switcher-dot')
const switcherIconClassName = ns.e('switcher-icon')
const itemTitleClassName = ns.e('item-title')
const childrenClassName = ns.e('children')

/**
 * 生成节点缩进所需的层级样式变量。
 */
const createItemStyle = () =>
  ({
    '--fl-tree-level': String(props.node.level)
  }) as CSSProperties & Record<string, string>

/**
 * 判断当前节点是否按叶子节点视觉渲染。
 */
const resolveLeafNodeState = () => props.node.isLeaf || props.node.children.length === 0

/**
 * 返回已解析完成的语义化 classNames。
 */
const getResolvedClassNames = () => props.resolvedClassNames

/**
 * 返回已解析完成的语义化 styles。
 */
const getResolvedStyles = () => props.resolvedStyles

const itemStyle = computed(createItemStyle)
const isLeafNode = computed(resolveLeafNodeState)
const semanticClassNames = computed(getResolvedClassNames)
const semanticStyles = computed(getResolvedStyles)
</script>
