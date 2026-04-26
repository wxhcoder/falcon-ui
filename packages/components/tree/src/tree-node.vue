<template>
  <!-- 递归节点消费主入口下发的展开/选中状态与事件派发能力，不再自行维护树状态。 -->
  <div
    :class="[itemClassName, semanticClassNames.item, node.className]"
    :style="[semanticStyles.item, itemStyle]"
    role="treeitem"
    :aria-expanded="isExpandableNode ? isExpandedNode : undefined"
    :aria-checked="nodeAriaChecked"
    :aria-selected="isSelectableNode ? isSelectedNode : undefined"
    :aria-level="node.level">
    <div
      :class="[
        itemContentClassName,
        ns.is('selected', isSelectedNode),
        ns.is('disabled', node.disabled)
      ]"
      @click="handleNodeContentClick">
      <span
        :class="[itemIconClassName, semanticClassNames.itemIcon]"
        :style="semanticStyles.itemIcon">
        <span v-if="isLeafNode" :class="switcherDotClassName" aria-hidden="true" />
        <button
          v-else
          type="button"
          :class="switcherButtonClassName"
          :aria-label="isExpandedNode ? '收起节点' : '展开节点'"
          @click.stop="handleSwitcherClick">
          <ElIcon :class="switcherIconClassName" aria-hidden="true">
            <CaretBottom v-if="isExpandedNode" />
            <CaretRight v-else />
          </ElIcon>
        </button>
      </span>
      <span
        v-if="shouldShowCheckbox"
        :class="[itemCheckboxClassName, semanticClassNames.itemCheckbox]"
        :style="semanticStyles.itemCheckbox"
        @click.stop="handleCheckboxClick">
        <ElCheckbox
          :model-value="isCheckedNode"
          :indeterminate="isHalfCheckedNode"
          :disabled="isCurrentCheckboxDisabled"
          aria-label="Select tree node" />
      </span>
      <span
        :class="[itemTitleClassName, semanticClassNames.itemTitle]"
        :style="semanticStyles.itemTitle">
        {{ node.label }}
      </span>
    </div>
    <div v-if="isExpandableNode && isExpandedNode" :class="childrenClassName" role="group">
      <FlTreeNode
        v-for="childNode in node.childNodes"
        :key="childNode.key"
        :node="childNode"
        :on-node-content-click="onNodeContentClick"
        :is-node-expanded="isNodeExpanded"
        :is-node-checked="isNodeChecked"
        :is-node-half-checked="isNodeHalfChecked"
        :is-node-selected="isNodeSelected"
        :tree-checkable="treeCheckable"
        :tree-selectable="treeSelectable"
        :is-checkbox-disabled="isCheckboxDisabled"
        :should-render-checkbox="shouldRenderCheckbox"
        :toggle-node-checked="toggleNodeChecked"
        :toggle-node-expansion="toggleNodeExpansion"
        :resolved-class-names="resolvedClassNames"
        :resolved-styles="resolvedStyles" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { CaretBottom, CaretRight } from '@element-plus/icons-vue'
import { ElCheckbox, ElIcon } from 'element-plus'
import { useNamespace } from '@falcon-ui/utils'
import { computed, getCurrentInstance, type CSSProperties } from 'vue'
import type {
  TreeClassValue,
  TreeKey,
  TreeNodeInstance,
  TreeNodeModel,
  TreeSemanticRecord
} from './tree'

defineOptions({
  name: 'FlTreeNode'
})

/**
 * 内部节点组件只接收标准化节点和主入口下发的展开状态能力。
 */
interface TreeNodeComponentProps {
  node: TreeNodeModel
  onNodeContentClick: (options: {
    node: TreeNodeModel
    component: TreeNodeInstance
    event: MouseEvent
  }) => void
  isNodeExpanded: (nodeKey: TreeKey) => boolean
  isNodeChecked: (nodeKey: TreeKey) => boolean
  isNodeHalfChecked: (nodeKey: TreeKey) => boolean
  isNodeSelected: (nodeKey: TreeKey) => boolean
  treeCheckable: boolean
  treeSelectable: boolean
  isCheckboxDisabled: (node: TreeNodeModel) => boolean
  shouldRenderCheckbox: (node: TreeNodeModel) => boolean
  toggleNodeChecked: (options: { node: TreeNodeModel; event: MouseEvent }) => void
  toggleNodeExpansion: (options: { node: TreeNodeModel; instance: TreeNodeInstance }) => void
  resolvedClassNames: TreeSemanticRecord<TreeClassValue>
  resolvedStyles: TreeSemanticRecord<CSSProperties>
}

const props = defineProps<TreeNodeComponentProps>()
const currentInstance = getCurrentInstance()
const ns = useNamespace('tree')
const itemClassName = ns.e('item')
const itemContentClassName = ns.e('item-content')
const itemIconClassName = ns.e('item-icon')
const itemCheckboxClassName = ns.e('item-checkbox')
const switcherButtonClassName = ns.e('switcher-button')
const switcherDotClassName = ns.e('switcher-dot')
const switcherIconClassName = ns.e('switcher-icon')
const itemTitleClassName = ns.e('item-title')
const childrenClassName = ns.e('children')

/**
 * 返回当前递归节点组件的 public instance。
 */
const getNodeInstance = (): TreeNodeInstance => currentInstance?.proxy ?? null

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
const resolveExpandableNodeState = () => props.node.childNodes.length > 0

/**
 * 判断当前节点是否处于展开状态。
 */
const resolveExpandedNodeState = () =>
  props.node.childNodes.length > 0 && props.isNodeExpanded(props.node.key)

/**
 * 判断当前节点是否按叶子节点视觉渲染。
 */
const resolveLeafNodeState = () => props.node.isLeaf || props.node.childNodes.length === 0

/**
 * 判断当前节点是否允许输出选中态语义。
 */
const resolveSelectableNodeState = () =>
  props.treeSelectable && props.node.selectable && !props.node.disabled

/**
 * 判断当前节点是否处于选中态。
 */
const resolveSelectedNodeState = () => props.isNodeSelected(props.node.key)

/**
 * 判断当前节点是否处于勾选态。
 */
const resolveCheckedNodeState = () => props.isNodeChecked(props.node.key)

/**
 * 判断当前节点是否处于 half-checked 状态。
 */
const resolveHalfCheckedNodeState = () => props.isNodeHalfChecked(props.node.key)

/**
 * 判断当前节点复选框是否应表现为禁用。
 */
const resolveCheckboxDisabledState = () => props.isCheckboxDisabled(props.node)

/**
 * 判断当前节点是否应渲染复选框。
 */
const resolveCheckboxVisibleState = () =>
  props.treeCheckable && props.shouldRenderCheckbox(props.node)

/**
 * 根据 checked / half-checked 结果生成节点级 `aria-checked`。
 */
const resolveAriaCheckedState = () => {
  if (!resolveCheckboxVisibleState()) {
    return undefined
  }

  if (resolveHalfCheckedNodeState()) {
    return 'mixed'
  }

  return resolveCheckedNodeState() ? 'true' : 'false'
}

/**
 * 处理节点内容区点击，统一派发 `node-click` 与单选事件。
 */
const handleNodeContentClick = (event: MouseEvent) => {
  props.onNodeContentClick({
    node: props.node,
    component: getNodeInstance(),
    event
  })
}

/**
 * 点击复选框只走勾选链路，不触发展开或选择事件。
 */
const handleCheckboxClick = (event: MouseEvent) => {
  if (!resolveCheckboxVisibleState() || props.isCheckboxDisabled(props.node)) {
    return
  }

  props.toggleNodeChecked({
    node: props.node,
    event
  })
}

/**
 * 切换当前节点的展开状态；阶段 4 起 switcher 不再触发选中链路。
 */
const handleSwitcherClick = () => {
  if (props.node.childNodes.length === 0) {
    return
  }

  props.toggleNodeExpansion({
    node: props.node,
    instance: getNodeInstance()
  })
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
const isCheckedNode = computed(resolveCheckedNodeState)
const isHalfCheckedNode = computed(resolveHalfCheckedNodeState)
const isCurrentCheckboxDisabled = computed(resolveCheckboxDisabledState)
const shouldShowCheckbox = computed(resolveCheckboxVisibleState)
const isSelectableNode = computed(resolveSelectableNodeState)
const isSelectedNode = computed(resolveSelectedNodeState)
const nodeAriaChecked = computed(resolveAriaCheckedState)
const semanticClassNames = computed(getResolvedClassNames)
const semanticStyles = computed(getResolvedStyles)
</script>
