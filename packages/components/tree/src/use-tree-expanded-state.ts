import { computed, ref, shallowRef, watch, type ComputedRef } from 'vue'
import {
  collectAncestorExpandedKeys,
  collectExpandableTreeKeys,
  createEffectiveExpandedKeySet,
  createTreeEventNode,
  filterTreeExpandedKeys,
  pruneTreeKeySet,
  type TreeExpandPayload,
  type TreeIndex,
  type TreeKey,
  type TreeNode,
  type TreeNodeInstance,
  type TreeNodeModel,
  type TreeProps
} from './tree'

/**
 * 统一约束组合式展开状态层的输入参数。
 */
interface UseTreeExpandedStateOptions {
  props: TreeProps
  treeIndex: ComputedRef<TreeIndex>
  emit: TreeExpandedStateEmit
}

/**
 * 灞曞紑鐘舵€佸眰鍙叧蹇冨睍寮€鐩稿叧鐨勪簨浠跺悎鍚屻€?
 */
export interface TreeExpandedStateEmit {
  (event: 'update:expandedKeys', value: TreeKey[]): void
  (event: 'expand', payload: TreeExpandPayload): void
  (
    event: 'node-expand',
    data: TreeNodeModel['data'],
    node: TreeNode,
    instance: TreeNodeInstance
  ): void
  (
    event: 'node-collapse',
    data: TreeNodeModel['data'],
    node: TreeNode,
    instance: TreeNodeInstance
  ): void
}

/**
 * 切换展开状态时需要的节点上下文。
 */
interface ToggleNodeExpansionOptions {
  node: TreeNodeModel
  instance: TreeNodeInstance
}

/**
 * 切换源展开键数组中的单个节点键，保持原有顺序并在末尾追加新键。
 */
const toggleExpandedKey = (expandedKeys: TreeKey[], nodeKey: TreeKey): TreeKey[] => {
  if (expandedKeys.includes(nodeKey)) {
    return expandedKeys.filter((key) => key !== nodeKey)
  }

  return [...expandedKeys, nodeKey]
}

/**
 * 构建非受控模式的初始化源展开键集合。
 */
const createInitialSourceExpandedKeys = (props: TreeProps, treeIndex: TreeIndex): TreeKey[] => {
  if (props.defaultExpandedKeys !== undefined) {
    return filterTreeExpandedKeys(props.defaultExpandedKeys, treeIndex.keyNodeMap)
  }

  if (props.defaultExpandAll) {
    return collectExpandableTreeKeys(treeIndex.nodes)
  }

  return []
}

/**
 * 仅在非受控初始化阶段，为 `defaultExpandedKeys` 生成祖先自动展开集合。
 */
const createInitialInheritedExpandedKeySet = (
  props: TreeProps,
  treeIndex: TreeIndex,
  sourceExpandedKeys: TreeKey[]
): Set<TreeKey> => {
  if (props.defaultExpandedKeys === undefined || !props.defaultExpandParent) {
    return new Set<TreeKey>()
  }

  const ancestorExpandedKeys = collectAncestorExpandedKeys(
    sourceExpandedKeys,
    treeIndex.parentKeyMap
  )

  for (const key of sourceExpandedKeys) {
    ancestorExpandedKeys.delete(key)
  }

  return ancestorExpandedKeys
}

/**
 * 合并非受控模式的源展开键与初始化继承展开键，生成实际渲染集合。
 */
const createUncontrolledEffectiveExpandedKeySet = ({
  sourceExpandedKeys,
  inheritedExpandedKeySet,
  collapsedInheritedKeySet
}: {
  sourceExpandedKeys: TreeKey[]
  inheritedExpandedKeySet: Set<TreeKey>
  collapsedInheritedKeySet: Set<TreeKey>
}): Set<TreeKey> => {
  const effectiveExpandedKeys = new Set<TreeKey>(sourceExpandedKeys)

  for (const key of inheritedExpandedKeySet) {
    if (!collapsedInheritedKeySet.has(key)) {
      effectiveExpandedKeys.add(key)
    }
  }

  return effectiveExpandedKeys
}

/**
 * FlTree 阶段 3 的展开状态层：
 * 1. 管理非受控初始化与受控渲染优先级
 * 2. 区分源展开键与最终渲染展开集合
 * 3. 统一收口 switcher 展开/收起事件
 */
export const useTreeExpandedState = ({ props, treeIndex, emit }: UseTreeExpandedStateOptions) => {
  const uncontrolledSourceExpandedKeys = shallowRef<TreeKey[]>([])
  const inheritedExpandedKeySet = shallowRef(new Set<TreeKey>())
  const collapsedInheritedKeySet = shallowRef(new Set<TreeKey>())
  const hasInitializedUncontrolledState = ref(false)

  /**
   * 只要外部显式传入 `expandedKeys`，组件即进入受控模式。
   */
  const isControlled = computed(() => props.expandedKeys !== undefined)

  /**
   * 受控模式下直接基于外部 prop 过滤源展开键。
   */
  const controlledSourceExpandedKeys = computed(() =>
    filterTreeExpandedKeys(props.expandedKeys, treeIndex.value.keyNodeMap)
  )

  /**
   * 返回当前模式下对外可观察的源展开键集合。
   */
  const getCurrentSourceExpandedKeys = () =>
    isControlled.value ? controlledSourceExpandedKeys.value : uncontrolledSourceExpandedKeys.value

  /**
   * 初始化或裁剪非受控模式内部状态。
   */
  const syncUncontrolledExpandedState = () => {
    if (!hasInitializedUncontrolledState.value) {
      const initialSourceExpandedKeys = createInitialSourceExpandedKeys(props, treeIndex.value)

      uncontrolledSourceExpandedKeys.value = initialSourceExpandedKeys
      inheritedExpandedKeySet.value = createInitialInheritedExpandedKeySet(
        props,
        treeIndex.value,
        initialSourceExpandedKeys
      )
      collapsedInheritedKeySet.value = new Set<TreeKey>()
      hasInitializedUncontrolledState.value = true
      return
    }

    uncontrolledSourceExpandedKeys.value = filterTreeExpandedKeys(
      uncontrolledSourceExpandedKeys.value,
      treeIndex.value.keyNodeMap
    )
    inheritedExpandedKeySet.value = pruneTreeKeySet(
      inheritedExpandedKeySet.value,
      treeIndex.value.keyNodeMap
    )
    collapsedInheritedKeySet.value = pruneTreeKeySet(
      collapsedInheritedKeySet.value,
      treeIndex.value.keyNodeMap
    )
  }

  /**
   * 受控模式下按 `autoExpandParent` 规则计算最终渲染集合。
   */
  const createControlledEffectiveExpandedKeySet = () =>
    createEffectiveExpandedKeySet({
      sourceExpandedKeys: controlledSourceExpandedKeys.value,
      parentKeyMap: treeIndex.value.parentKeyMap,
      includeAncestorKeys: Boolean(props.autoExpandParent)
    })

  /**
   * 非受控模式下合并源展开键与初始化阶段的祖先补齐结果。
   */
  const createLocalEffectiveExpandedKeySet = () =>
    createUncontrolledEffectiveExpandedKeySet({
      sourceExpandedKeys: uncontrolledSourceExpandedKeys.value,
      inheritedExpandedKeySet: inheritedExpandedKeySet.value,
      collapsedInheritedKeySet: collapsedInheritedKeySet.value
    })

  /**
   * 获取当前模式下真正驱动渲染的展开集合。
   */
  const effectiveExpandedKeySet = computed(() =>
    isControlled.value
      ? createControlledEffectiveExpandedKeySet()
      : createLocalEffectiveExpandedKeySet()
  )

  /**
   * 判断指定节点当前是否处于展开状态。
   */
  const isNodeExpanded = (nodeKey: TreeKey) => effectiveExpandedKeySet.value.has(nodeKey)

  /**
   * 统一发送展开 / 收起事件。
   */
  const emitNodeToggleEvent = ({
    node,
    instance,
    nextEffectiveExpandedKeySet
  }: {
    node: TreeNodeModel
    instance: TreeNodeInstance
    nextEffectiveExpandedKeySet: Set<TreeKey>
  }) => {
    const eventNode = createTreeEventNode({
      node,
      resolveExpanded: (nodeKey) => nextEffectiveExpandedKeySet.has(nodeKey)
    })

    if (nextEffectiveExpandedKeySet.has(node.key)) {
      emit('node-expand', node.data, eventNode, instance)
      return
    }

    emit('node-collapse', node.data, eventNode, instance)
  }

  /**
   * 统一发送展开状态变更事件。
   */
  const emitExpandedStateChange = ({
    node,
    instance,
    nextSourceExpandedKeys,
    nextEffectiveExpandedKeySet
  }: {
    node: TreeNodeModel
    instance: TreeNodeInstance
    nextSourceExpandedKeys: TreeKey[]
    nextEffectiveExpandedKeySet: Set<TreeKey>
  }) => {
    emit('update:expandedKeys', nextSourceExpandedKeys)
    emitNodeToggleEvent({
      node,
      instance,
      nextEffectiveExpandedKeySet
    })
    emit('expand', {
      expanded: nextEffectiveExpandedKeySet.has(node.key),
      node: node.data,
      key: node.key,
      expandedKeys: nextSourceExpandedKeys
    })
  }

  /**
   * 切换指定节点的展开状态：
   * 1. 受控模式只发事件，不落本地最终状态
   * 2. 非受控模式更新本地源展开键，并保留后代展开缓存
   */
  const toggleNodeExpansion = ({ node, instance }: ToggleNodeExpansionOptions) => {
    if (node.childNodes.length === 0) {
      return
    }

    if (isControlled.value) {
      const nextSourceExpandedKeys = toggleExpandedKey(controlledSourceExpandedKeys.value, node.key)
      const nextEffectiveExpandedKeySet = createEffectiveExpandedKeySet({
        sourceExpandedKeys: nextSourceExpandedKeys,
        parentKeyMap: treeIndex.value.parentKeyMap,
        includeAncestorKeys: Boolean(props.autoExpandParent)
      })

      emitExpandedStateChange({
        node,
        instance,
        nextSourceExpandedKeys,
        nextEffectiveExpandedKeySet
      })
      return
    }

    let nextSourceExpandedKeys = uncontrolledSourceExpandedKeys.value
    let nextCollapsedInheritedKeySet = collapsedInheritedKeySet.value

    if (uncontrolledSourceExpandedKeys.value.includes(node.key)) {
      nextSourceExpandedKeys = toggleExpandedKey(uncontrolledSourceExpandedKeys.value, node.key)
    } else if (inheritedExpandedKeySet.value.has(node.key)) {
      nextCollapsedInheritedKeySet = new Set<TreeKey>(collapsedInheritedKeySet.value)

      if (nextCollapsedInheritedKeySet.has(node.key)) {
        nextCollapsedInheritedKeySet.delete(node.key)
      } else {
        nextCollapsedInheritedKeySet.add(node.key)
      }
    } else {
      nextSourceExpandedKeys = toggleExpandedKey(uncontrolledSourceExpandedKeys.value, node.key)
    }

    uncontrolledSourceExpandedKeys.value = nextSourceExpandedKeys
    collapsedInheritedKeySet.value = nextCollapsedInheritedKeySet

    const nextEffectiveExpandedKeySet = createUncontrolledEffectiveExpandedKeySet({
      sourceExpandedKeys: nextSourceExpandedKeys,
      inheritedExpandedKeySet: inheritedExpandedKeySet.value,
      collapsedInheritedKeySet: nextCollapsedInheritedKeySet
    })

    emitExpandedStateChange({
      node,
      instance,
      nextSourceExpandedKeys,
      nextEffectiveExpandedKeySet
    })
  }

  watch(
    [treeIndex, isControlled],
    () => {
      if (!isControlled.value) {
        syncUncontrolledExpandedState()
      }
    },
    { immediate: true }
  )

  return {
    effectiveExpandedKeySet,
    isControlled,
    isNodeExpanded,
    sourceExpandedKeys: computed(getCurrentSourceExpandedKeys),
    toggleNodeExpansion
  }
}
