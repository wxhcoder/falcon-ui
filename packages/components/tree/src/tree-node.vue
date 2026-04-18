<template>
  <!-- 阶段 2 在递归节点中引入展开状态切换，但仍不承接阶段 3 的默认展开和受控展开。 -->
  <div
    :class="[itemClassName, semanticClassNames.item, node.className]"
    :style="[semanticStyles.item, itemStyle]"
    role="treeitem"
    :aria-expanded="isExpandableNode ? isExpandedNode : undefined"
    :aria-level="node.level">
    <div :class="itemContentClassName">
      <span
        :class="[itemIconClassName, semanticClassNames.itemIcon]"
        :style="semanticStyles.itemIcon">
        <span v-if="isLeafNode" :class="switcherDotClassName" aria-hidden="true" />
        <button
          v-else
          type="button"
          :class="switcherButtonClassName"
          :aria-label="isExpandedNode ? '收起节点' : '展开节点'"
          @click.stop="toggleCurrentNodeExpansion">
          <ElIcon :class="switcherIconClassName" aria-hidden="true">
            <CaretBottom v-if="isExpandedNode" />
            <CaretRight v-else />
          </ElIcon>
        </button>
      </span>
      <span
        :class="[itemTitleClassName, semanticClassNames.itemTitle]"
        :style="semanticStyles.itemTitle">
        {{ node.label }}
      </span>
    </div>
    <div v-if="isExpandableNode && isExpandedNode" :class="childrenClassName" role="group">
      <FlTreeNode
        v-for="childNode in node.children"
        :key="childNode.key"
        :node="childNode"
        :is-node-expanded="isNodeExpanded"
        :toggle-node-expansion="toggleNodeExpansion"
        :resolved-class-names="resolvedClassNames"
        :resolved-styles="resolvedStyles" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { CaretBottom, CaretRight } from '@element-plus/icons-vue'
import { ElIcon } from 'element-plus'
import { useNamespace } from '@falcon-ui/utils'
import { computed, type CSSProperties } from 'vue'
import type {
  FlTreeClassValue,
  FlTreeKey,
  FlTreeNormalizedNode,
  FlTreeSemanticRecord
} from './tree-types'

defineOptions({
  name: 'FlTreeNode'
})

/**
 * 内部节点组件只接收标准化节点和主入口下发的展开状态能力。
 */
interface TreeNodeProps {
  node: FlTreeNormalizedNode
  isNodeExpanded: (nodeKey: FlTreeKey) => boolean
  toggleNodeExpansion: (nodeKey: FlTreeKey) => void
  resolvedClassNames: FlTreeSemanticRecord<FlTreeClassValue>
  resolvedStyles: FlTreeSemanticRecord<CSSProperties>
}

const props = defineProps<TreeNodeProps>()
const ns = useNamespace('tree')
const itemClassName = ns.e('item')
const itemContentClassName = ns.e('item-content')
const itemIconClassName = ns.e('item-icon')
const switcherButtonClassName = ns.e('switcher-button')
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
 * 判断当前节点是否具备展开能力。
 */
const resolveExpandableNodeState = () => props.node.children.length > 0

/**
 * 判断当前节点是否处于展开状态。
 */
const resolveExpandedNodeState = () =>
  props.node.children.length > 0 && props.isNodeExpanded(props.node.key)

/**
 * 判断当前节点是否按叶子节点视觉渲染。
 */
const resolveLeafNodeState = () => props.node.isLeaf || props.node.children.length === 0

/**
 * 切换当前节点的展开状态。
 */
const toggleCurrentNodeExpansion = () => {
  if (props.node.children.length === 0) {
    return
  }

  props.toggleNodeExpansion(props.node.key)
}

/**
 * 返回已经解析完成的语义化 classNames。
 */
const getResolvedClassNames = () => props.resolvedClassNames

/**
 * 返回已经解析完成的语义化 styles。
 */
const getResolvedStyles = () => props.resolvedStyles

const itemStyle = computed(createItemStyle)
const isExpandableNode = computed(resolveExpandableNodeState)
const isExpandedNode = computed(resolveExpandedNodeState)
const isLeafNode = computed(resolveLeafNodeState)
const semanticClassNames = computed(getResolvedClassNames)
const semanticStyles = computed(getResolvedStyles)
</script>
