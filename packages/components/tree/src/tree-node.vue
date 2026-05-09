<template>
  <!-- 递归节点消费主入口下发的树状态与交互能力，连线模式仅补充渲染结构，不改动事件链路。 -->
  <div
    :class="[
      itemClassName,
      semanticClassNames.item,
      node.className,
      ns.is('line-mode', showLine),
      ns.is('leaf', isLeafNode),
      ns.is('last', isLastSiblingNode)
    ]"
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
        ns.is('disabled', node.disabled),
        ns.is('line-mode', showLine),
        ns.is('draggable', isDraggableNode),
        ns.is('dragging', isDraggingNode),
        ns.is('drop-target', isDropTargetNode),
        ns.is('drop-allowed', isDropAllowedNode),
        ns.is('drop-forbidden', isDropForbiddenNode),
        ns.is('drop-before', isDropBeforeNode),
        ns.is('drop-inside', isDropInsideNode),
        ns.is('drop-after', isDropAfterNode)
      ]"
      :draggable="isDraggableNode ? true : undefined"
      @click="handleNodeContentClick"
      @dragstart.stop="handleDragStart"
      @dragenter.stop="handleDragEnter"
      @dragover.stop="handleDragOver"
      @dragleave.stop="handleDragLeave"
      @drop.stop="handleDrop"
      @dragend.stop="handleDragEnd">
      <span v-if="lineTrackEnds.length > 0" :class="indentClassName" aria-hidden="true">
        <span
          v-for="(isTrackEnd, index) in lineTrackEnds"
          :key="`${String(node.key)}-${index}`"
          :class="[indentUnitClassName, ns.is('end', isTrackEnd)]" />
      </span>
      <span :class="[itemIconClassName, ns.is('leaf', isLeafNode)]">
        <span
          v-if="isLeafNode && showLine"
          :class="[switcherClassName, switcherNoopClassName]"
          aria-hidden="true">
          <span :class="switcherLeafLineClassName" />
        </span>
        <span v-else-if="isLeafNode" :class="switcherDotClassName" aria-hidden="true" />
        <span v-else :class="switcherClassName">
          <button
            type="button"
            :class="switcherButtonClassName"
            :aria-label="isExpandedNode ? '收起节点' : '展开节点'"
            :disabled="isLoadingNode"
            @click.stop="handleSwitcherClick">
            <ElIcon
              :class="[switcherIconClassName, ns.is('loading', isLoadingNode)]"
              aria-hidden="true">
              <component :is="switcherLoadingIcon" v-if="isLoadingNode" />
              <template v-else-if="switcherIcon === 'plus-minus'">
                <MinusSquareOutlined v-if="isExpandedNode" />
                <PlusSquareOutlined v-else />
              </template>
              <template v-else-if="switcherIcon === 'folder'">
                <FolderOpened v-if="isExpandedNode" />
                <Folder v-else />
              </template>
              <template v-else>
                <CaretBottom v-if="isExpandedNode" />
                <CaretRight v-else />
              </template>
            </ElIcon>
          </button>
        </span>
      </span>
      <span
        v-if="shouldShowCheckbox"
        :class="itemCheckboxClassName"
        @click.stop="handleCheckboxClick">
        <ElCheckbox
          :model-value="isCheckedNode"
          :indeterminate="isHalfCheckedNode"
          :disabled="isCurrentCheckboxDisabled"
          aria-label="Select tree node" />
      </span>
      <span :class="itemTitleClassName">
        <slot v-if="hasDefaultSlot" :node="slotNode" :data="node.data" />
        <template v-else>{{ node.label }}</template>
      </span>
    </div>
    <div v-if="hasChildNodes && isExpandedNode" :class="childrenClassName" role="group">
      <FlTreeNode
        v-for="childNode in node.childNodes"
        :key="childNode.key"
        :node="childNode"
        :on-node-content-click="onNodeContentClick"
        :is-node-expanded="isNodeExpanded"
        :is-node-checked="isNodeChecked"
        :is-node-half-checked="isNodeHalfChecked"
        :is-node-selected="isNodeSelected"
        :is-node-loading="isNodeLoading"
        :is-node-expandable="isNodeExpandable"
        :is-node-draggable="isNodeDraggable"
        :is-node-dragging="isNodeDragging"
        :is-node-drop-target="isNodeDropTarget"
        :is-node-drop-allowed="isNodeDropAllowed"
        :get-node-drop-type="getNodeDropType"
        :tree-checkable="treeCheckable"
        :tree-selectable="treeSelectable"
        :show-line="showLine"
        :switcher-icon="switcherIcon"
        :switcher-loading-icon="switcherLoadingIcon"
        :is-checkbox-disabled="isCheckboxDisabled"
        :should-render-checkbox="shouldRenderCheckbox"
        :toggle-node-checked="toggleNodeChecked"
        :toggle-node-expansion="toggleNodeExpansion"
        :handle-node-drag-start="handleNodeDragStart"
        :handle-node-drag-enter="handleNodeDragEnter"
        :handle-node-drag-over="handleNodeDragOver"
        :handle-node-drag-leave="handleNodeDragLeave"
        :handle-node-drop="handleNodeDrop"
        :handle-node-drag-end="handleNodeDragEnd"
        :resolved-class-names="resolvedClassNames"
        :resolved-styles="resolvedStyles">
        <template v-if="hasDefaultSlot" #default="slotProps">
          <slot v-bind="slotProps" />
        </template>
      </FlTreeNode>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MinusSquareOutlined, PlusSquareOutlined } from '@falcon-ui/icons'
import { CaretBottom, CaretRight, Folder, FolderOpened } from '@element-plus/icons-vue'
import { ElCheckbox, ElIcon } from 'element-plus'
import { useNamespace } from '@falcon-ui/utils'
import { computed, getCurrentInstance, type CSSProperties } from 'vue'
import {
  createTreeEventNode,
  type TreeData,
  type TreeClassValue,
  type TreeKey,
  type TreeNode,
  type TreeNodeDropType,
  type TreeNodeInstance,
  type TreeNodeModel,
  type TreeSemanticRecord,
  type TreeSwitcherLoadingIcon,
  type TreeSwitcherIconMode
} from './tree'

defineOptions({
  name: 'FlTreeNode'
})

interface TreeNodeDragTargetHandlerOptions {
  node: TreeNodeModel
  event: DragEvent
  element: HTMLElement
}

interface TreeNodeDragHandlerOptions {
  node: TreeNodeModel
  event: DragEvent
}

/**
 * 内部节点组件只接收标准化节点和主入口下发的树状态能力。
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
  isNodeLoading: (nodeKey: TreeKey) => boolean
  isNodeExpandable: (node: TreeNodeModel) => boolean
  isNodeDraggable: (node: TreeNodeModel) => boolean
  isNodeDragging: (nodeKey: TreeKey) => boolean
  isNodeDropTarget: (nodeKey: TreeKey) => boolean
  isNodeDropAllowed: (nodeKey: TreeKey) => boolean
  getNodeDropType: (nodeKey: TreeKey) => TreeNodeDropType | undefined
  treeCheckable: boolean
  treeSelectable: boolean
  showLine: boolean
  switcherIcon: TreeSwitcherIconMode
  switcherLoadingIcon: TreeSwitcherLoadingIcon
  isCheckboxDisabled: (node: TreeNodeModel) => boolean
  shouldRenderCheckbox: (node: TreeNodeModel) => boolean
  toggleNodeChecked: (options: { node: TreeNodeModel; event: MouseEvent }) => void
  toggleNodeExpansion: (options: { node: TreeNodeModel; instance: TreeNodeInstance }) => void
  handleNodeDragStart: (options: TreeNodeDragHandlerOptions) => void
  handleNodeDragEnter: (options: TreeNodeDragTargetHandlerOptions) => void
  handleNodeDragOver: (options: TreeNodeDragTargetHandlerOptions) => void
  handleNodeDragLeave: (options: TreeNodeDragTargetHandlerOptions) => void
  handleNodeDrop: (options: TreeNodeDragTargetHandlerOptions) => void
  handleNodeDragEnd: (options: TreeNodeDragHandlerOptions) => void
  resolvedClassNames: TreeSemanticRecord<TreeClassValue>
  resolvedStyles: TreeSemanticRecord<CSSProperties>
}

const props = defineProps<TreeNodeComponentProps>()
const slots = defineSlots<{
  default?: (props: { node: TreeNode; data: TreeData }) => unknown
}>()
const currentInstance = getCurrentInstance()
const ns = useNamespace('tree')
const itemClassName = ns.e('item')
const itemContentClassName = ns.e('item-content')
const indentClassName = ns.e('indent')
const indentUnitClassName = ns.e('indent-unit')
const itemIconClassName = ns.e('item-icon')
const itemCheckboxClassName = ns.e('item-checkbox')
const switcherClassName = ns.e('switcher')
const switcherNoopClassName = ns.em('switcher', 'noop')
const switcherButtonClassName = ns.e('switcher-button')
const switcherDotClassName = ns.e('switcher-dot')
const switcherIconClassName = ns.e('switcher-icon')
const switcherLeafLineClassName = ns.e('switcher-leaf-line')
const itemTitleClassName = ns.e('item-title')
const childrenClassName = ns.e('children')

/**
 * 返回当前递归节点组件的 public instance。
 */
const getNodeInstance = (): TreeNodeInstance => currentInstance?.proxy ?? null

/**
 * 生成节点基础样式变量，保留层级信息供样式调试与后续扩展使用。
 */
const createItemStyle = () =>
  ({
    '--fl-tree-level': String(props.node.level)
  }) as CSSProperties & Record<string, string>

/**
 * 判断当前节点是否具备展开能力。
 */
const resolveExpandableNodeState = () => props.isNodeExpandable(props.node)

/**
 * 判断当前节点是否存在已经渲染到数据树中的子节点。
 */
const resolveHasChildNodesState = () => props.node.childNodes.length > 0

/**
 * 判断当前节点是否处于展开状态。
 */
const resolveExpandedNodeState = () =>
  resolveExpandableNodeState() && props.isNodeExpanded(props.node.key)

/**
 * 判断当前节点是否按叶子节点视觉渲染。
 */
const resolveLeafNodeState = () => !resolveExpandableNodeState()

/**
 * 判断当前节点是否处于异步加载中。
 */
const resolveLoadingNodeState = () => props.isNodeLoading(props.node.key)

/**
 * 返回当前节点祖先轨道的终止状态列表，用于逐层渲染连线轨道。
 */
const resolveLineTrackEnds = () => props.node.lineTrackEnds

/**
 * 判断当前节点是否为所在层级的最后一个兄弟节点。
 */
const resolveLastSiblingNodeState = () => props.node.isLastSibling

/**
 * 判断当前节点是否允许作为原生拖拽源。
 */
const resolveDraggableNodeState = () => props.isNodeDraggable(props.node)

/**
 * 判断当前节点是否正在作为拖拽源。
 */
const resolveDraggingNodeState = () => props.isNodeDragging(props.node.key)

/**
 * 判断当前节点是否为当前拖拽悬停目标。
 */
const resolveDropTargetNodeState = () => props.isNodeDropTarget(props.node.key)

/**
 * 判断当前拖拽悬停目标是否允许投放。
 */
const resolveDropAllowedNodeState = () => props.isNodeDropAllowed(props.node.key)

/**
 * 返回当前节点落点类型。
 */
const resolveNodeDropType = () => props.getNodeDropType(props.node.key)

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
 * 处理节点内容区点击，统一派发 `node-click` 与选择事件。
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
 * 切换当前节点的展开状态；阶段 4 起 switcher 不再触发选择链路。
 */
const handleSwitcherClick = () => {
  if (!resolveExpandableNodeState() || resolveLoadingNodeState()) {
    return
  }

  props.toggleNodeExpansion({
    node: props.node,
    instance: getNodeInstance()
  })
}

/**
 * 返回拖拽事件当前绑定的内容区元素。
 */
const getDragEventElement = (event: DragEvent) => event.currentTarget as HTMLElement

/**
 * 处理原生 dragstart。
 */
const handleDragStart = (event: DragEvent) => {
  props.handleNodeDragStart({
    node: props.node,
    event
  })
}

/**
 * 处理原生 dragenter。
 */
const handleDragEnter = (event: DragEvent) => {
  props.handleNodeDragEnter({
    node: props.node,
    event,
    element: getDragEventElement(event)
  })
}

/**
 * 处理原生 dragover。
 */
const handleDragOver = (event: DragEvent) => {
  props.handleNodeDragOver({
    node: props.node,
    event,
    element: getDragEventElement(event)
  })
}

/**
 * 处理原生 dragleave。
 */
const handleDragLeave = (event: DragEvent) => {
  props.handleNodeDragLeave({
    node: props.node,
    event,
    element: getDragEventElement(event)
  })
}

/**
 * 处理原生 drop。
 */
const handleDrop = (event: DragEvent) => {
  props.handleNodeDrop({
    node: props.node,
    event,
    element: getDragEventElement(event)
  })
}

/**
 * 处理原生 dragend。
 */
const handleDragEnd = (event: DragEvent) => {
  props.handleNodeDragEnd({
    node: props.node,
    event
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
const hasDefaultSlot = computed(() => Boolean(slots.default))
const isExpandableNode = computed(resolveExpandableNodeState)
const hasChildNodes = computed(resolveHasChildNodesState)
const isExpandedNode = computed(resolveExpandedNodeState)
const isLeafNode = computed(resolveLeafNodeState)
const isLoadingNode = computed(resolveLoadingNodeState)
const lineTrackEnds = computed(resolveLineTrackEnds)
const isLastSiblingNode = computed(resolveLastSiblingNodeState)
const isDraggableNode = computed(resolveDraggableNodeState)
const isDraggingNode = computed(resolveDraggingNodeState)
const isDropTargetNode = computed(resolveDropTargetNodeState)
const isDropAllowedNode = computed(resolveDropAllowedNodeState)
const nodeDropType = computed(resolveNodeDropType)
const isDropForbiddenNode = computed(() => isDropTargetNode.value && !isDropAllowedNode.value)
const isDropBeforeNode = computed(() => isDropTargetNode.value && nodeDropType.value === 'before')
const isDropInsideNode = computed(() => isDropTargetNode.value && nodeDropType.value === 'inner')
const isDropAfterNode = computed(() => isDropTargetNode.value && nodeDropType.value === 'after')
const isCheckedNode = computed(resolveCheckedNodeState)
const isHalfCheckedNode = computed(resolveHalfCheckedNodeState)
const isCurrentCheckboxDisabled = computed(resolveCheckboxDisabledState)
const shouldShowCheckbox = computed(resolveCheckboxVisibleState)
const isSelectableNode = computed(resolveSelectableNodeState)
const isSelectedNode = computed(resolveSelectedNodeState)
const nodeAriaChecked = computed(resolveAriaCheckedState)
const slotNode = computed(() => createTreeEventNode({ node: props.node }))
const semanticClassNames = computed(getResolvedClassNames)
const semanticStyles = computed(getResolvedStyles)
</script>
