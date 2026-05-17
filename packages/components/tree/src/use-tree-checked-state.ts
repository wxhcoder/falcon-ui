import { computed, ref, shallowRef, watch, type ComputedRef } from 'vue'
import {
  createTreeEventNode,
  type TreeCheckEvent,
  type TreeCheckedKeys,
  type TreeIndex,
  type TreeInteractionEvent,
  type TreeKey,
  type TreeNodeModel,
  type TreeProps
} from './tree'
import {
  createTreeCheckedKeysValue,
  normalizeTreeCheckedState,
  type TreeCheckedState,
  toggleConductedTreeCheckedState
} from './use-tree-check-conduct'

interface UseTreeCheckedStateOptions {
  props: TreeProps
  treeIndex: ComputedRef<TreeIndex>
  emit: TreeCheckedStateEmit
}

export interface TreeCheckedStateEmit {
  (event: 'update:checkedKeys', value: TreeCheckedKeys): void
  (event: 'check', checkedKeys: TreeCheckedKeys, checkEvent: TreeCheckEvent): void
}

interface ToggleCheckedNodeOptions {
  node: TreeNodeModel
  event: TreeInteractionEvent
}

/**
 * FlTree 阶段 7-9 的勾选状态层统一负责：
 * 1. 默认联动模式的父子传导与半选态
 * 2. strict 模式的 `{ checked, halfChecked }` 对象态
 * 3. key-based 禁用、禁用 checkbox 与隐藏 checkbox 的交互边界
 */
export const useTreeCheckedState = ({ props, treeIndex, emit }: UseTreeCheckedStateOptions) => {
  const uncontrolledCheckedState = shallowRef<TreeCheckedState>({
    checkedKeys: [],
    halfCheckedKeys: []
  })
  const hasInitializedUncontrolledState = ref(false)

  /**
   * 显式传入 `checkedKeys` 时，组件进入受控勾选模式。
   */
  const isControlled = computed(() => props.checkedKeys !== undefined)

  /**
   * 树级 `checkable` 仅负责复选框的渲染与交互开关。
   */
  const isTreeCheckable = computed(() => props.checkable === true)

  /**
   * `checkStrictly` 决定当前对外值形态与勾选计算模式。
   */
  const isStrictMode = computed(() => props.checkStrictly === true)

  /**
   * 受控模式下始终按当前模式归一化外部勾选结果。
   */
  const controlledCheckedState = computed(() =>
    normalizeTreeCheckedState({
      checkedKeys: props.checkedKeys,
      treeIndex: treeIndex.value,
      strict: isStrictMode.value
    })
  )

  /**
   * 返回当前模式下对外可观察的勾选状态。
   */
  const getCurrentCheckedState = () =>
    isControlled.value ? controlledCheckedState.value : uncontrolledCheckedState.value

  /**
   * 统一返回当前 checked 集合。
   */
  const getCurrentCheckedKeys = () => getCurrentCheckedState().checkedKeys

  /**
   * 统一返回当前 half-checked 集合。
   */
  const getCurrentHalfCheckedKeys = () => getCurrentCheckedState().halfCheckedKeys

  /**
   * 初始化或裁剪非受控勾选状态：
   * 1. 首次只消费 `defaultCheckedKeys`
   * 2. 后续数据变更只裁剪失效 key
   * 3. 模式切换时复用当前可见状态重新归一化
   */
  const syncUncontrolledCheckedState = () => {
    if (!hasInitializedUncontrolledState.value) {
      uncontrolledCheckedState.value = normalizeTreeCheckedState({
        checkedKeys: props.defaultCheckedKeys,
        treeIndex: treeIndex.value,
        strict: isStrictMode.value
      })
      hasInitializedUncontrolledState.value = true
      return
    }

    uncontrolledCheckedState.value = normalizeTreeCheckedState({
      checkedKeys: createTreeCheckedKeysValue({
        strict: isStrictMode.value,
        checkedKeys: uncontrolledCheckedState.value.checkedKeys,
        halfCheckedKeys: uncontrolledCheckedState.value.halfCheckedKeys
      }),
      treeIndex: treeIndex.value,
      strict: isStrictMode.value
    })
  }

  /**
   * 判断指定节点当前是否处于 checked 状态。
   */
  const isNodeChecked = (nodeKey: TreeKey) => getCurrentCheckedKeys().includes(nodeKey)

  /**
   * 判断指定节点当前是否处于 half-checked 状态。
   */
  const isNodeHalfChecked = (nodeKey: TreeKey) => getCurrentHalfCheckedKeys().includes(nodeKey)

  /**
   * `hiddenCheckboxKeys` 只隐藏当前节点复选框，不阻断后代勾选。
   */
  const shouldRenderCheckbox = (node: TreeNodeModel) => node.checkboxVisible

  /**
   * `disabledKeys` 与 `disabledCheckboxKeys` 都会使当前节点复选框不可交互。
   */
  const isCheckboxDisabled = (node: TreeNodeModel) => node.checkboxDisabled

  /**
   * 判断当前节点是否允许响应复选框点击。
   */
  const canToggleNode = (node: TreeNodeModel) =>
    isTreeCheckable.value && shouldRenderCheckbox(node) && !isCheckboxDisabled(node)

  /**
   * strict 模式下只增删 `checked`，`halfChecked` 仅由外部回写控制。
   */
  const createNextStrictCheckedState = (nodeKey: TreeKey): TreeCheckedState => {
    const currentCheckedState = getCurrentCheckedState()
    const nextCheckedKeys = currentCheckedState.checkedKeys.includes(nodeKey)
      ? currentCheckedState.checkedKeys.filter((key) => key !== nodeKey)
      : [...currentCheckedState.checkedKeys, nodeKey]
    const nextCheckedKeySet = new Set<TreeKey>(nextCheckedKeys)

    return {
      checkedKeys: nextCheckedKeys,
      halfCheckedKeys: currentCheckedState.halfCheckedKeys.filter(
        (key) => key !== nodeKey && !nextCheckedKeySet.has(key)
      )
    }
  }

  /**
   * 根据当前模式生成下一次勾选结果。
   */
  const createNextCheckedState = (node: TreeNodeModel) =>
    isStrictMode.value
      ? createNextStrictCheckedState(node.key)
      : toggleConductedTreeCheckedState({
          node,
          checkedKeys: getCurrentCheckedKeys(),
          treeIndex: treeIndex.value
        })

  /**
   * 统一抛出勾选状态变更事件，并补齐 half-checked 信息。
   */
  const emitCheckedStateChange = ({
    node,
    event,
    nextCheckedState
  }: {
    node: TreeNodeModel
    event: TreeInteractionEvent
    nextCheckedState: TreeCheckedState
  }) => {
    const nextCheckedKeysValue = createTreeCheckedKeysValue({
      strict: isStrictMode.value,
      checkedKeys: nextCheckedState.checkedKeys,
      halfCheckedKeys: nextCheckedState.halfCheckedKeys
    })

    emit('update:checkedKeys', nextCheckedKeysValue)
    emit('check', nextCheckedKeysValue, {
      checked: nextCheckedState.checkedKeys.includes(node.key),
      node: createTreeEventNode({ node }),
      checkedNodes: nextCheckedState.checkedKeys
        .map((key) => treeIndex.value.keyNodeMap.get(key))
        .filter((item): item is TreeNodeModel => item !== undefined)
        .map((checkedNode) => createTreeEventNode({ node: checkedNode })),
      halfCheckedKeys: nextCheckedState.halfCheckedKeys,
      key: node.key,
      event
    })
  }

  /**
   * 切换当前节点勾选状态。
   */
  const toggleCheckedNode = ({ node, event }: ToggleCheckedNodeOptions) => {
    if (!canToggleNode(node)) {
      return
    }

    const nextCheckedState = createNextCheckedState(node)

    if (!isControlled.value) {
      uncontrolledCheckedState.value = nextCheckedState
    }

    emitCheckedStateChange({
      node,
      event,
      nextCheckedState
    })
  }

  watch(
    [treeIndex, isControlled, isStrictMode],
    () => {
      if (!isControlled.value) {
        syncUncontrolledCheckedState()
      }
    },
    { immediate: true }
  )

  return {
    checkedKeys: computed(getCurrentCheckedKeys),
    halfCheckedKeys: computed(getCurrentHalfCheckedKeys),
    isCheckboxDisabled,
    isControlled,
    isNodeChecked,
    isNodeHalfChecked,
    isStrictMode,
    isTreeCheckable,
    shouldRenderCheckbox,
    toggleCheckedNode
  }
}
