import { computed, shallowRef, watch, type ComputedRef } from 'vue'
import {
  createTreeEventNode,
  resolveTreeNodePropsConfig,
  type TreeData,
  type TreeIndex,
  type TreeKey,
  type TreeNode,
  type TreeNodeDragEndArgs,
  type TreeNodeDragStartArgs,
  type TreeNodeDragTargetArgs,
  type TreeNodeDropArgs,
  type TreeNodeDropType,
  type TreeNodeModel,
  type TreeProps
} from './tree'

interface UseTreeDragStateOptions {
  props: TreeProps
  treeIndex: ComputedRef<TreeIndex>
  emit: TreeDragStateEmit
  notifyDataChange: () => void
}

export interface TreeDragStateEmit {
  (event: 'node-drag-start', ...args: TreeNodeDragStartArgs): void
  (event: 'node-drag-enter', ...args: TreeNodeDragTargetArgs): void
  (event: 'node-drag-over', ...args: TreeNodeDragTargetArgs): void
  (event: 'node-drag-leave', ...args: TreeNodeDragTargetArgs): void
  (event: 'node-drag-end', ...args: TreeNodeDragEndArgs): void
  (event: 'node-drop', ...args: TreeNodeDropArgs): void
}

interface TreeDragTargetState {
  key: TreeKey
  dropType: TreeNodeDropType
}

interface TreeDragTargetOptions {
  node: TreeNodeModel
  event: DragEvent
  element: HTMLElement
}

interface TreeDragNodeOptions {
  node: TreeNodeModel
  event: DragEvent
}

interface TreeDataLocation {
  parent: TreeData[]
  index: number
  node: TreeData
}

interface TreeDropPermission {
  prev: boolean
  inner: boolean
  next: boolean
}

/**
 * 判断 source 是否包含 target。
 */
const containsTreeNode = (source: TreeNodeModel, target: TreeNodeModel): boolean =>
  source.childNodes.some(
    (childNode) => childNode.key === target.key || containsTreeNode(childNode, target)
  )

/**
 * 读取原始节点 children；拖拽排序必须遵守 props.children 字段映射。
 */
const readRawChildren = (node: TreeData, childrenFieldName: string): TreeData[] => {
  const childrenValue = node[childrenFieldName]

  return Array.isArray(childrenValue) ? (childrenValue as TreeData[]) : []
}

/**
 * 获取可写 children，不存在时按字段映射创建空数组。
 */
const ensureRawChildren = (node: TreeData, childrenFieldName: string): TreeData[] => {
  const childrenValue = node[childrenFieldName]

  if (Array.isArray(childrenValue)) {
    return childrenValue as TreeData[]
  }

  const nextChildren: TreeData[] = []
  node[childrenFieldName] = nextChildren

  return nextChildren
}

/**
 * 在原始数据中定位指定 key 的节点与所在数组。
 */
const findTreeDataLocation = (
  nodes: TreeData[],
  targetKey: TreeKey,
  childrenFieldName: string
): TreeDataLocation | undefined => {
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index]

    if (node.key === targetKey) {
      return {
        parent: nodes,
        index,
        node
      }
    }

    const childLocation = findTreeDataLocation(
      readRawChildren(node, childrenFieldName),
      targetKey,
      childrenFieldName
    )

    if (childLocation) {
      return childLocation
    }
  }

  return undefined
}

/**
 * 计算 Element Plus 风格的实际投放类型。
 */
const resolveDropType = ({
  event,
  element,
  permission
}: {
  event: DragEvent
  element: HTMLElement
  permission: TreeDropPermission
}): TreeNodeDropType => {
  const rect = element.getBoundingClientRect()

  if (rect.height <= 0) {
    return permission.inner ? 'inner' : 'none'
  }

  const prevPercent = permission.prev
    ? permission.inner
      ? 0.25
      : permission.next
        ? 0.45
        : 1
    : Number.NEGATIVE_INFINITY
  const nextPercent = permission.next
    ? permission.inner
      ? 0.75
      : permission.prev
        ? 0.55
        : 0
    : Number.POSITIVE_INFINITY
  const distance = event.clientY - rect.top

  if (distance < rect.height * prevPercent) {
    return 'before'
  }

  if (distance > rect.height * nextPercent) {
    return 'after'
  }

  return permission.inner ? 'inner' : 'none'
}

/**
 * FlTree 拖拽状态层，对齐 Element Plus Tree：
 * 1. dragend 阶段内部原地重排 data
 * 2. 使用 node-drag-* / node-drop 多参数事件
 * 3. allowDrop 按 prev / inner / next 三种类型分别判断
 */
export const useTreeDragState = ({
  props,
  treeIndex,
  emit,
  notifyDataChange
}: UseTreeDragStateOptions) => {
  const dragNodeKey = shallowRef<TreeKey | null>(null)
  const dragTargetState = shallowRef<TreeDragTargetState | null>(null)

  const isTreeDraggable = computed(() => props.draggable === true)

  const getDragNode = () => {
    if (dragNodeKey.value === null) {
      return undefined
    }

    return treeIndex.value.keyNodeMap.get(dragNodeKey.value)
  }

  const getDropNode = () => {
    const dropNodeKey = dragTargetState.value?.key

    if (dropNodeKey === undefined) {
      return undefined
    }

    return treeIndex.value.keyNodeMap.get(dropNodeKey)
  }

  const createEventNode = (node: TreeNodeModel): TreeNode => createTreeEventNode({ node })

  const isNodeDraggable = () => isTreeDraggable.value

  const getSiblings = (node: TreeNodeModel) =>
    node.parent ? node.parent.childNodes : treeIndex.value.nodes

  const applyBuiltinDropRules = (
    permission: TreeDropPermission,
    draggingNode: TreeNodeModel,
    dropNode: TreeNodeModel
  ): TreeDropPermission => {
    const nextPermission = { ...permission }
    const siblings = getSiblings(dropNode)
    const dropNodeIndex = siblings.findIndex((node) => node.key === dropNode.key)

    if (siblings[dropNodeIndex + 1]?.key === draggingNode.key) {
      nextPermission.next = false
    }

    if (siblings[dropNodeIndex - 1]?.key === draggingNode.key) {
      nextPermission.prev = false
    }

    if (dropNode.childNodes.some((childNode) => childNode.key === draggingNode.key)) {
      nextPermission.inner = false
    }

    if (draggingNode.key === dropNode.key || containsTreeNode(draggingNode, dropNode)) {
      nextPermission.prev = false
      nextPermission.inner = false
      nextPermission.next = false
    }

    return nextPermission
  }

  const createUserDropPermission = (
    draggingNode: TreeNodeModel,
    dropNode: TreeNodeModel
  ): TreeDropPermission => {
    if (typeof props.allowDrop !== 'function') {
      return {
        prev: true,
        inner: true,
        next: true
      }
    }

    const draggingEventNode = createEventNode(draggingNode)
    const dropEventNode = createEventNode(dropNode)

    return {
      prev: props.allowDrop(draggingEventNode, dropEventNode, 'prev') !== false,
      inner: props.allowDrop(draggingEventNode, dropEventNode, 'inner') !== false,
      next: props.allowDrop(draggingEventNode, dropEventNode, 'next') !== false
    }
  }

  const createDropPermission = (
    draggingNode: TreeNodeModel,
    dropNode: TreeNodeModel
  ): TreeDropPermission =>
    applyBuiltinDropRules(createUserDropPermission(draggingNode, dropNode), draggingNode, dropNode)

  const updateDragTargetState = ({
    node,
    event,
    element
  }: TreeDragTargetOptions): {
    draggingNode: TreeNodeModel
    dropNode: TreeNodeModel
    previousDropNode: TreeNodeModel | undefined
    dropType: TreeNodeDropType
  } | null => {
    const draggingNode = getDragNode()

    if (!draggingNode) {
      return null
    }

    const previousDropNode = getDropNode()
    const dropType = resolveDropType({
      event,
      element,
      permission: createDropPermission(draggingNode, node)
    })

    dragTargetState.value = {
      key: node.key,
      dropType
    }

    return {
      draggingNode,
      dropNode: node,
      previousDropNode,
      dropType
    }
  }

  const setNativeDragData = (event: DragEvent) => {
    if (!event.dataTransfer) {
      return
    }

    event.dataTransfer.effectAllowed = 'move'

    try {
      event.dataTransfer.setData('text/plain', '')
    } catch {
      /**
       * Firefox 需要 setData 才能启动拖拽；测试环境不支持时忽略。
       */
    }
  }

  const moveTreeData = ({
    dragKey,
    dropKey,
    dropType
  }: {
    dragKey: TreeKey
    dropKey: TreeKey
    dropType: Exclude<TreeNodeDropType, 'none'>
  }) => {
    const childrenFieldName = resolveTreeNodePropsConfig(props.props).children
    const rootData = props.data ?? []
    const dragLocation = findTreeDataLocation(rootData, dragKey, childrenFieldName)

    if (!dragLocation) {
      return false
    }

    const [dragData] = dragLocation.parent.splice(dragLocation.index, 1)
    const dropLocation = findTreeDataLocation(rootData, dropKey, childrenFieldName)

    if (!dragData || !dropLocation) {
      if (dragData) {
        dragLocation.parent.splice(
          Math.min(dragLocation.index, dragLocation.parent.length),
          0,
          dragData
        )
      }

      return false
    }

    if (dropType === 'inner') {
      ensureRawChildren(dropLocation.node, childrenFieldName).push(dragData)
      return true
    }

    const insertIndex = dropType === 'before' ? dropLocation.index : dropLocation.index + 1
    dropLocation.parent.splice(insertIndex, 0, dragData)

    return true
  }

  const handleNodeDragStart = ({ node, event }: TreeDragNodeOptions) => {
    if (!props.draggable) {
      return
    }

    if (typeof props.allowDrag === 'function' && !props.allowDrag(createEventNode(node))) {
      event.preventDefault()
      return
    }

    dragNodeKey.value = node.key
    dragTargetState.value = null
    setNativeDragData(event)
    emit('node-drag-start', createEventNode(node), event)
  }

  const handleNodeDragEnter = (options: TreeDragTargetOptions) => {
    if (!getDragNode()) {
      return
    }

    options.event.preventDefault()

    const currentTarget = updateDragTargetState(options)

    if (currentTarget) {
      emit(
        'node-drag-enter',
        createEventNode(currentTarget.draggingNode),
        createEventNode(currentTarget.dropNode),
        options.event
      )
    }
  }

  const handleNodeDragOver = (options: TreeDragTargetOptions) => {
    if (!getDragNode()) {
      return
    }

    options.event.preventDefault()

    const previousTargetKey = dragTargetState.value?.key
    const currentTarget = updateDragTargetState(options)

    if (!currentTarget) {
      return
    }

    if (options.event.dataTransfer) {
      options.event.dataTransfer.dropEffect = currentTarget.dropType === 'none' ? 'none' : 'move'
    }

    if (previousTargetKey !== currentTarget.dropNode.key) {
      if (currentTarget.previousDropNode) {
        emit(
          'node-drag-leave',
          createEventNode(currentTarget.draggingNode),
          createEventNode(currentTarget.previousDropNode),
          options.event
        )
      }

      emit(
        'node-drag-enter',
        createEventNode(currentTarget.draggingNode),
        createEventNode(currentTarget.dropNode),
        options.event
      )
    }

    emit(
      'node-drag-over',
      createEventNode(currentTarget.draggingNode),
      createEventNode(currentTarget.dropNode),
      options.event
    )
  }

  const handleNodeDragLeave = ({ node, event }: TreeDragTargetOptions) => {
    const draggingNode = getDragNode()

    if (!draggingNode || dragTargetState.value?.key !== node.key) {
      return
    }

    dragTargetState.value = null
    emit('node-drag-leave', createEventNode(draggingNode), createEventNode(node), event)
  }

  const handleNodeDrop = ({ event }: TreeDragTargetOptions) => {
    if (!getDragNode()) {
      return
    }

    event.preventDefault()
  }

  const handleNodeDragEnd = ({ node, event }: TreeDragNodeOptions) => {
    const draggingNode = getDragNode() ?? node
    const dropNode = getDropNode()
    const targetState = dragTargetState.value
    let finalDropType = targetState?.dropType ?? 'none'
    let moved = false

    event.preventDefault()

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = finalDropType === 'none' ? 'none' : 'move'
    }

    if (dropNode && finalDropType !== 'none') {
      moved = moveTreeData({
        dragKey: draggingNode.key,
        dropKey: dropNode.key,
        dropType: finalDropType
      })

      if (moved) {
        notifyDataChange()
      } else {
        finalDropType = 'none'
      }
    }

    const latestDraggingNode = treeIndex.value.keyNodeMap.get(draggingNode.key) ?? draggingNode
    const latestDropNode = dropNode
      ? (treeIndex.value.keyNodeMap.get(dropNode.key) ?? dropNode)
      : null

    if (dragNodeKey.value !== null) {
      emit(
        'node-drag-end',
        createEventNode(latestDraggingNode),
        latestDropNode ? createEventNode(latestDropNode) : null,
        finalDropType,
        event
      )

      if (moved && latestDropNode && finalDropType !== 'none') {
        emit(
          'node-drop',
          createEventNode(latestDraggingNode),
          createEventNode(latestDropNode),
          finalDropType,
          event
        )
      }
    }

    dragNodeKey.value = null
    dragTargetState.value = null
  }

  const isNodeDragging = (nodeKey: TreeKey) => dragNodeKey.value === nodeKey

  const isNodeDropTarget = (nodeKey: TreeKey) => dragTargetState.value?.key === nodeKey

  const isNodeDropAllowed = (nodeKey: TreeKey) =>
    dragTargetState.value?.key === nodeKey && dragTargetState.value.dropType !== 'none'

  const getNodeDropType = (nodeKey: TreeKey) =>
    dragTargetState.value?.key === nodeKey ? dragTargetState.value.dropType : undefined

  const syncDragState = () => {
    if (dragNodeKey.value !== null && !treeIndex.value.keyNodeMap.has(dragNodeKey.value)) {
      dragNodeKey.value = null
    }

    const targetKey = dragTargetState.value?.key

    if (targetKey !== undefined && !treeIndex.value.keyNodeMap.has(targetKey)) {
      dragTargetState.value = null
    }
  }

  watch(treeIndex, syncDragState)

  return {
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
  }
}
