import { computed, ref, shallowRef, watch, type ComputedRef } from 'vue'
import {
  createTreeEventNode,
  filterTreeCheckedKeys,
  type TreeCheckEvent,
  type TreeIndex,
  type TreeKey,
  type TreeNodeModel,
  type TreeProps
} from './tree'

interface UseTreeCheckedStateOptions {
  props: TreeProps
  treeIndex: ComputedRef<TreeIndex>
  emit: TreeCheckedStateEmit
}

export interface TreeCheckedStateEmit {
  (event: 'update:checkedKeys', value: TreeKey[]): void
  (event: 'check', checkedKeys: TreeKey[], checkEvent: TreeCheckEvent): void
}

interface ToggleCheckedNodeOptions {
  node: TreeNodeModel
  event: MouseEvent
}

/**
 * 过滤非法、重复或已不存在的 checked key。
 * 本阶段保留 disabled / disableCheckbox 节点的已勾选显示，不在此处裁剪。
 */
const normalizeTreeCheckedKeys = (keys: TreeKey[] | undefined, treeIndex: TreeIndex) =>
  filterTreeCheckedKeys(keys, treeIndex.keyNodeMap)

/**
 * FlTree 阶段 6 的勾选状态层负责：
 * 1. 对齐 checkedKeys 的受控 / 非受控语义
 * 2. 在 checkStrictly=true 时提供独立勾选增删
 * 3. 在数据变更后仅裁剪失效 key，不重置默认值
 */
export const useTreeCheckedState = ({ props, treeIndex, emit }: UseTreeCheckedStateOptions) => {
  const uncontrolledCheckedKeys = shallowRef<TreeKey[]>([])
  const hasInitializedUncontrolledState = ref(false)

  /**
   * 显式传入 checkedKeys 时，组件进入受控勾选模式。
   */
  const isControlled = computed(() => props.checkedKeys !== undefined)

  /**
   * tree 级别开启 checkable 时才渲染勾选能力。
   */
  const isTreeCheckable = computed(() => props.checkable === true)

  /**
   * 本阶段只有 checkStrictly=true 才允许用户独立切换勾选。
   */
  const isStrictlyCheckable = computed(
    () => props.checkable === true && props.checkStrictly === true
  )

  /**
   * 受控模式下直接从外部 prop 归一化当前勾选结果。
   */
  const controlledCheckedKeys = computed(() =>
    normalizeTreeCheckedKeys(props.checkedKeys, treeIndex.value)
  )

  /**
   * 返回当前模式下对外可观察的勾选 key 集合。
   */
  const getCurrentCheckedKeys = () =>
    isControlled.value ? controlledCheckedKeys.value : uncontrolledCheckedKeys.value

  /**
   * 初始化或裁剪非受控勾选状态。
   */
  const syncUncontrolledCheckedState = () => {
    if (!hasInitializedUncontrolledState.value) {
      uncontrolledCheckedKeys.value = normalizeTreeCheckedKeys(
        props.defaultCheckedKeys,
        treeIndex.value
      )
      hasInitializedUncontrolledState.value = true
      return
    }

    uncontrolledCheckedKeys.value = normalizeTreeCheckedKeys(
      uncontrolledCheckedKeys.value,
      treeIndex.value
    )
  }

  /**
   * 判断指定节点当前是否处于勾选态。
   */
  const isNodeChecked = (nodeKey: TreeKey) => getCurrentCheckedKeys().includes(nodeKey)

  /**
   * disabled 与 disableCheckbox 都应在复选框上表现为禁用。
   */
  const isCheckboxDisabled = (node: TreeNodeModel) => node.disabled || node.disableCheckbox

  /**
   * 本阶段只有严格独立勾选分支允许切换，且禁用节点不可交互。
   */
  const canToggleNode = (node: TreeNodeModel) =>
    isStrictlyCheckable.value && !isCheckboxDisabled(node)

  /**
   * 勾选未选中节点时追加到末尾；取消时只移除当前节点。
   */
  const createNextCheckedKeys = (nodeKey: TreeKey): TreeKey[] => {
    const currentCheckedKeys = getCurrentCheckedKeys()

    if (currentCheckedKeys.includes(nodeKey)) {
      return currentCheckedKeys.filter((key) => key !== nodeKey)
    }

    return [...currentCheckedKeys, nodeKey]
  }

  /**
   * 统一抛出勾选变更事件。
   */
  const emitCheckedStateChange = ({
    node,
    event,
    nextCheckedKeys
  }: {
    node: TreeNodeModel
    event: MouseEvent
    nextCheckedKeys: TreeKey[]
  }) => {
    emit('update:checkedKeys', nextCheckedKeys)
    emit('check', nextCheckedKeys, {
      checked: nextCheckedKeys.includes(node.key),
      node: createTreeEventNode({ node }),
      checkedNodes: nextCheckedKeys
        .map((key) => treeIndex.value.keyNodeMap.get(key))
        .filter((item): item is TreeNodeModel => item !== undefined)
        .map((checkedNode) => createTreeEventNode({ node: checkedNode })),
      key: node.key,
      event
    })
  }

  /**
   * 在严格独立勾选分支中切换当前节点的勾选状态。
   */
  const toggleCheckedNode = ({ node, event }: ToggleCheckedNodeOptions) => {
    if (!canToggleNode(node)) {
      return
    }

    const nextCheckedKeys = createNextCheckedKeys(node.key)

    if (!isControlled.value) {
      uncontrolledCheckedKeys.value = nextCheckedKeys
    }

    emitCheckedStateChange({
      node,
      event,
      nextCheckedKeys
    })
  }

  watch(
    [treeIndex, isControlled],
    () => {
      if (!isControlled.value) {
        syncUncontrolledCheckedState()
      }
    },
    { immediate: true }
  )

  return {
    checkedKeys: computed(getCurrentCheckedKeys),
    isCheckboxDisabled,
    isControlled,
    isNodeChecked,
    isStrictlyCheckable,
    isTreeCheckable,
    toggleCheckedNode
  }
}
