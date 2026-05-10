import { computed, ref, shallowRef, watch, type ComputedRef } from 'vue'
import {
  createTreeEventNode,
  filterTreeSelectedKeys,
  type TreeIndex,
  type TreeInteractionEvent,
  type TreeKey,
  type TreeNodeModel,
  type TreeProps,
  type TreeSelectEvent
} from './tree'

interface UseTreeSelectedStateOptions {
  props: TreeProps
  treeIndex: ComputedRef<TreeIndex>
  emit: TreeSelectedStateEmit
}

export interface TreeSelectedStateEmit {
  (event: 'update:selectedKeys', value: TreeKey[]): void
  (event: 'select', selectedKeys: TreeKey[], selectEvent: TreeSelectEvent): void
}

interface SelectNodeOptions {
  node: TreeNodeModel
  event: TreeInteractionEvent
}

/**
 * 过滤非法 key，并跳过 disabled / selectable=false 的节点。
 */
const collectSelectableKeys = (keys: TreeKey[] | undefined, treeIndex: TreeIndex): TreeKey[] =>
  filterTreeSelectedKeys(keys, treeIndex.keyNodeMap).filter((key) => {
    const node = treeIndex.keyNodeMap.get(key)

    if (!node) {
      return false
    }

    return !node.disabled && node.selectable
  })

/**
 * FlTree 阶段 5 的选中状态层同时承接单选与多选语义：
 * 1. 受控模式只读取外部 selectedKeys
 * 2. 非受控模式只在初始化时消费 defaultSelectedKeys
 * 3. 后续数据变化只做 key 裁剪，不重复初始化
 */
export const useTreeSelectedState = ({ props, treeIndex, emit }: UseTreeSelectedStateOptions) => {
  const uncontrolledSelectedKeys = shallowRef<TreeKey[]>([])
  const hasInitializedUncontrolledState = ref(false)

  /**
   * 只要树级 selectable 没有被显式关闭，就允许节点进入选中能力判定。
   */
  const isTreeSelectable = computed(() => props.selectable !== false)

  /**
   * 显式传入 selectedKeys 时，组件进入受控选中模式。
   */
  const isControlled = computed(() => props.selectedKeys !== undefined)

  /**
   * `multiple=true` 时，普通树进入点击增删的多选语义。
   */
  const isMultiple = computed(() => props.multiple === true)

  /**
   * 统一归一化选中 key：
   * 1. 去重并过滤非法 key
   * 2. 跳过 disabled / selectable=false 节点
   * 3. 单选模式只保留第一个合法 key，多选模式保留完整集合
   */
  const normalizeSelectedKeys = (keys: TreeKey[] | undefined): TreeKey[] => {
    if (!isTreeSelectable.value) {
      return []
    }

    const selectableKeys = collectSelectableKeys(keys, treeIndex.value)

    if (isMultiple.value) {
      return selectableKeys
    }

    return selectableKeys.length > 0 ? [selectableKeys[0]!] : []
  }

  /**
   * 受控模式下直接基于外部 prop 解析当前选中结果。
   */
  const controlledSelectedKeys = computed(() => normalizeSelectedKeys(props.selectedKeys))

  /**
   * 返回当前模式下对外可观察的源选中 key 集合。
   */
  const getCurrentSelectedKeys = () =>
    isControlled.value ? controlledSelectedKeys.value : uncontrolledSelectedKeys.value

  /**
   * 初始化或裁剪非受控选中状态。
   */
  const syncUncontrolledSelectedState = () => {
    if (!hasInitializedUncontrolledState.value) {
      uncontrolledSelectedKeys.value = normalizeSelectedKeys(props.defaultSelectedKeys)
      hasInitializedUncontrolledState.value = true
      return
    }

    uncontrolledSelectedKeys.value = normalizeSelectedKeys(uncontrolledSelectedKeys.value)
  }

  /**
   * 判断当前节点是否允许进入选中态。
   */
  const canSelectNode = (node: TreeNodeModel) =>
    isTreeSelectable.value && !node.disabled && node.selectable

  /**
   * 判断指定节点当前是否处于选中态。
   */
  const isNodeSelected = (nodeKey: TreeKey) => getCurrentSelectedKeys().includes(nodeKey)

  /**
   * 统一抛出选中变更事件。
   */
  const emitSelectedStateChange = ({
    node,
    event,
    nextSelectedKeys
  }: {
    node: TreeNodeModel
    event: TreeInteractionEvent
    nextSelectedKeys: TreeKey[]
  }) => {
    emit('update:selectedKeys', nextSelectedKeys)
    emit('select', nextSelectedKeys, {
      selected: nextSelectedKeys.includes(node.key),
      node: createTreeEventNode({ node }),
      /**
       * `selectedNodes` 返回的是事件层 `TreeNode[]`，不暴露原始 `TreeData[]`。
       * 业务侧如果需要原始数据，可统一通过 `eventNode.data` 读取。
       */
      selectedNodes: nextSelectedKeys
        .map((key) => treeIndex.value.keyNodeMap.get(key))
        .filter((item): item is TreeNodeModel => item !== undefined)
        .map((selectedNode) => createTreeEventNode({ node: selectedNode })),
      key: node.key,
      event
    })
  }

  /**
   * 基于当前模式生成下一次选中结果：
   * 1. 单选模式保持阶段 4 语义
   * 2. 多选模式点击未选中节点时追加，点击已选中节点时仅移除当前节点
   */
  const createNextSelectedKeys = (nodeKey: TreeKey): TreeKey[] => {
    const currentSelectedKeys = getCurrentSelectedKeys()

    if (!isMultiple.value) {
      return currentSelectedKeys.includes(nodeKey) ? [] : [nodeKey]
    }

    if (currentSelectedKeys.includes(nodeKey)) {
      return currentSelectedKeys.filter((key) => key !== nodeKey)
    }

    return [...currentSelectedKeys, nodeKey]
  }

  /**
   * 点击节点内容区时，根据当前模式切换单选或多选结果。
   */
  const selectNode = ({ node, event }: SelectNodeOptions) => {
    if (!canSelectNode(node)) {
      return
    }

    const nextSelectedKeys = createNextSelectedKeys(node.key)

    if (!isControlled.value) {
      uncontrolledSelectedKeys.value = nextSelectedKeys
    }

    emitSelectedStateChange({
      node,
      event,
      nextSelectedKeys
    })
  }

  watch(
    [treeIndex, isControlled, isTreeSelectable, isMultiple],
    () => {
      if (!isControlled.value) {
        syncUncontrolledSelectedState()
      }
    },
    { immediate: true }
  )

  return {
    isControlled,
    isNodeSelected,
    isTreeSelectable,
    selectNode,
    selectedKeys: computed(getCurrentSelectedKeys)
  }
}
