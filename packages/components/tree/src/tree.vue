<template>
  <!-- 根节点在阶段 4 起同时接入展开与单选状态层，并把渲染能力下发给递归节点。 -->
  <div
    v-bind="attrs"
    :class="[rootClassName, resolvedClassNames.root, ns.is('show-line', showLineEnabled)]"
    :style="resolvedStyles.root"
    :tabindex="rootTabIndex"
    role="tree"
    :aria-activedescendant="activeDescendantId"
    @keydown="handleTreeKeydown">
    <FlTreeNode
      v-for="node in treeIndex.nodes"
      :key="node.key"
      :node="node"
      :get-node-id="getNodeId"
      :register-node-element="registerNodeElement"
      :unregister-node-element="unregisterNodeElement"
      :on-node-content-click="handleNodeContentClick"
      :on-node-content-dblclick="handleNodeContentDblclick"
      :on-node-content-contextmenu="handleNodeContentContextmenu"
      :is-node-expanded="isNodeExpanded"
      :is-node-checked="isNodeChecked"
      :is-node-half-checked="isNodeHalfChecked"
      :is-node-selected="isNodeSelected"
      :is-node-focused="isNodeFocused"
      :is-node-filtered="isNodeFiltered"
      :is-node-loading="isNodeLoading"
      :is-node-expandable="isNodeExpandable"
      :is-node-draggable="isNodeDraggable"
      :is-node-dragging="isNodeDragging"
      :is-node-drop-target="isNodeDropTarget"
      :is-node-drop-allowed="isNodeDropAllowed"
      :get-node-drop-type="getNodeDropType"
      :tree-checkable="isTreeCheckable"
      :tree-selectable="isTreeSelectable"
      :show-line="showLineEnabled"
      :show-leaf-icon="showLeafIcon"
      :switcher-icon="props.switcherIcon"
      :switcher-loading-icon="props.switcherLoadingIcon"
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
</template>

<script setup lang="ts">
import { useNamespace } from '@falcon-ui/utils'
import { computed, ref, useAttrs, type CSSProperties } from 'vue'
import {
  buildTreeIndex,
  createTreeEventNode,
  resolveTreeSemanticRecord,
  treeEmits,
  treeProps,
  type TreeClassValue,
  type TreeData,
  type TreeExpose,
  type TreeInteractionEvent,
  type TreeNodeInstance,
  type TreeNode,
  type TreeNodeModel,
  type TreeSemanticRecord
} from './tree'
import FlTreeNode from './tree-node.vue'
import { useTreeCheckedState, type TreeCheckedStateEmit } from './use-tree-checked-state'
import { useTreeDragState, type TreeDragStateEmit } from './use-tree-drag'
import { useTreeExpandedState, type TreeExpandedStateEmit } from './use-tree-expanded-state'
import { useTreeKeyboardState } from './use-tree-keyboard'
import { useTreeLoadState, type TreeLoadStateEmit } from './use-tree-load'
import { useTreeScrollState } from './use-tree-scroll'
import { useTreeSelectedState, type TreeSelectedStateEmit } from './use-tree-selected-state'

defineOptions({
  name: 'FlTree',
  inheritAttrs: false
})

const props = defineProps(treeProps)
const emit = defineEmits(treeEmits)
const slots = defineSlots<{
  default?: (props: { node: TreeNode; data: TreeData }) => unknown
}>()
const attrs = useAttrs()
const ns = useNamespace('tree')
const rootClassName = ns.b()
const treeDataVersion = ref(0)

const notifyTreeDataChange = () => {
  treeDataVersion.value += 1
}

/**
 * 构建当前渲染所需的标准化树索引。
 */
const createCurrentTreeIndex = () => {
  void treeDataVersion.value
  return buildTreeIndex(props.data, props.props)
}

/**
 * 解析组件级语义化 classNames 配置。
 */
const createResolvedClassNames = () =>
  resolveTreeSemanticRecord(props.classNames, {
    props
  })

/**
 * 解析组件级语义化 styles 配置。
 */
const createResolvedStyles = () =>
  resolveTreeSemanticRecord(props.styles, {
    props
  })

const treeIndex = computed(createCurrentTreeIndex)
const hasDefaultSlot = computed(() => Boolean(slots.default))
const resolvedClassNames = computed<TreeSemanticRecord<TreeClassValue>>(createResolvedClassNames)
const resolvedStyles = computed<TreeSemanticRecord<CSSProperties>>(createResolvedStyles)
const showLineEnabled = computed(() => Boolean(props.showLine))
const showLeafIcon = computed(() =>
  typeof props.showLine === 'object' && props.showLine !== null
    ? props.showLine.showLeafIcon !== false
    : false
)
const rootTabIndex = computed(() => {
  const tabindex = attrs.tabindex ?? attrs.tabIndex

  return tabindex === undefined ? 0 : (tabindex as string | number)
})

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
  event: TreeInteractionEvent
}) => {
  emit('node-click', node.data, createTreeEventNode({ node }), component, event)
}

/**
 * 统一派发节点双击事件。`dblclick` 不暴露 `expanded` 字段。
 */
const emitNodeDblclick = ({
  node,
  component,
  event
}: {
  node: TreeNodeModel
  component: TreeNodeInstance
  event: MouseEvent
}) => {
  emit('dblclick', node.data, createTreeEventNode({ node }), component, event)
}

const emitNodeRightClick = ({
  node,
  component,
  event
}: {
  node: TreeNodeModel
  component: TreeNodeInstance
  event: MouseEvent
}) => {
  emit('right-click', node.data, createTreeEventNode({ node }), component, event)
}

const { isNodeLoaded, isNodeLoading, loadNode } = useTreeLoadState({
  props,
  treeIndex,
  emit: emit as TreeLoadStateEmit
})

const { registerNodeElement, scrollTo, unregisterNodeElement } = useTreeScrollState({
  treeIndex
})

/**
 * 异步加载开启时，无 children 且未加载的非叶子节点也需要展示 switcher。
 */
const isNodeExpandable = (node: TreeNodeModel) =>
  !node.isLeaf &&
  (node.childNodes.length > 0 ||
    isNodeLoading(node.key) ||
    (Boolean(props.loadData) && !isNodeLoaded(node.key)))

const { isNodeExpanded, toggleNodeExpansion: toggleExpandedNode } = useTreeExpandedState({
  props,
  treeIndex,
  emit: emit as TreeExpandedStateEmit,
  isNodeExpandable
})

const isNodeFiltered = (node: TreeNodeModel) =>
  Boolean(
    props.filterTreeNode?.(
      createTreeEventNode({
        node,
        resolveExpanded: isNodeExpanded
      })
    )
  )

const { isNodeSelected, isTreeSelectable, selectNode, selectedKeys } = useTreeSelectedState({
  props,
  treeIndex,
  emit: emit as TreeSelectedStateEmit
})

const {
  isCheckboxDisabled,
  isNodeChecked,
  isNodeHalfChecked,
  isTreeCheckable,
  shouldRenderCheckbox,
  toggleCheckedNode
} = useTreeCheckedState({
  props,
  treeIndex,
  emit: emit as TreeCheckedStateEmit
})

const {
  getNodeDropType,
  handleNodeDragEnd,
  handleNodeDragEnter,
  handleNodeDragLeave,
  handleNodeDragOver,
  handleNodeDragStart,
  handleNodeDrop,
  isNodeDraggable,
  isNodeDragging,
  isNodeDropAllowed,
  isNodeDropTarget
} = useTreeDragState({
  props,
  treeIndex,
  emit: emit as TreeDragStateEmit,
  notifyDataChange: notifyTreeDataChange
})

const {
  activeDescendantId,
  focusNode,
  getFocusedNode,
  getNodeId,
  isNodeFocused,
  moveFocusBy,
  moveFocusToFirstChild,
  moveFocusToParent
} = useTreeKeyboardState({
  treeIndex,
  selectedKeys,
  isNodeExpanded,
  isNodeExpandable
})

/**
 * 用户请求展开时先保持原展开事件顺序，再进入异步加载链路。
 */
const toggleNodeExpansion = (options: { node: TreeNodeModel; instance: TreeNodeInstance }) => {
  focusNode(options.node.key)

  const wasExpanded = isNodeExpanded(options.node.key)

  toggleExpandedNode(options)

  if (!wasExpanded) {
    void loadNode(options.node)
  }
}

const toggleNodeChecked = (options: { node: TreeNodeModel; event: TreeInteractionEvent }) => {
  focusNode(options.node.key)
  toggleCheckedNode(options)
}

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
  event: TreeInteractionEvent
}) => {
  focusNode(node.key)
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

/**
 * 节点内容区双击先派发独立事件，再复用展开与异步加载链路。
 */
const handleNodeContentDblclick = ({
  node,
  component,
  event
}: {
  node: TreeNodeModel
  component: TreeNodeInstance
  event: MouseEvent
}) => {
  focusNode(node.key)
  emitNodeDblclick({
    node,
    component,
    event
  })

  if (!isNodeExpandable(node) || isNodeLoading(node.key)) {
    return
  }

  toggleNodeExpansion({
    node,
    instance: component
  })
}

const handleNodeContentContextmenu = ({
  node,
  component,
  event
}: {
  node: TreeNodeModel
  component: TreeNodeInstance
  event: MouseEvent
}) => {
  focusNode(node.key)
  emitNodeRightClick({
    node,
    component,
    event
  })
}

const handleFocusedNodeAction = (node: TreeNodeModel, event: KeyboardEvent) => {
  handleNodeContentClick({
    node,
    component: null,
    event
  })
}

const handleTreeKeydown = (event: KeyboardEvent) => {
  const focusedNode = getFocusedNode()

  if (!focusedNode) {
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    moveFocusBy(1)
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    moveFocusBy(-1)
    return
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault()

    if (!isNodeExpandable(focusedNode)) {
      return
    }

    if (!isNodeExpanded(focusedNode.key)) {
      toggleNodeExpansion({
        node: focusedNode,
        instance: null
      })
      return
    }

    moveFocusToFirstChild(focusedNode)
    return
  }

  if (event.key === 'ArrowLeft') {
    event.preventDefault()

    if (isNodeExpandable(focusedNode) && isNodeExpanded(focusedNode.key)) {
      toggleNodeExpansion({
        node: focusedNode,
        instance: null
      })
      return
    }

    moveFocusToParent(focusedNode)
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    handleFocusedNodeAction(focusedNode, event)
    return
  }

  if (event.key === ' ') {
    event.preventDefault()

    if (isTreeCheckable.value) {
      toggleNodeChecked({
        node: focusedNode,
        event
      })
      return
    }

    handleFocusedNodeAction(focusedNode, event)
  }
}

const exposed: TreeExpose = {
  scrollTo
}

defineExpose(exposed)
</script>
