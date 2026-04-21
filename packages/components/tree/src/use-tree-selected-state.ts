import { computed, ref, shallowRef, watch, type ComputedRef } from 'vue'
import {
  createTreeEventNode,
  filterTreeSelectedKeys,
  type TreeIndex,
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
  event: MouseEvent
}

/**
 * 阶段 4 的选中状态层仅负责单选语义；多选仍留给后续阶段处理。
 */
export const useTreeSelectedState = ({ props, treeIndex, emit }: UseTreeSelectedStateOptions) => {
  const uncontrolledSelectedKeys = shallowRef<TreeKey[]>([])
  const hasInitializedUncontrolledState = ref(false)

  /**
   * 只要树级 `selectable` 没被显式关闭，就允许节点进入选中能力判定。
   */
  const isTreeSelectable = computed(() => props.selectable !== false)

  /**
   * 显式传入 `selectedKeys` 时，组件进入受控选中模式。
   */
  const isControlled = computed(() => props.selectedKeys !== undefined)

  /**
   * 统一过滤无效 key，并跳过 disabled / selectable=false 的节点。
   */
  const normalizeSelectedKeys = (keys: TreeKey[] | undefined): TreeKey[] => {
    if (!isTreeSelectable.value) {
      return []
    }

    const sourceSelectedKeys = filterTreeSelectedKeys(keys, treeIndex.value.keyNodeMap)

    for (const key of sourceSelectedKeys) {
      const node = treeIndex.value.keyNodeMap.get(key)

      if (node && !node.disabled && node.selectable) {
        return [key]
      }
    }

    return []
  }

  /**
   * 受控模式下直接基于外部 prop 解析当前单选结果。
   */
  const controlledSelectedKeys = computed(() => normalizeSelectedKeys(props.selectedKeys))

  /**
   * 返回当前模式下对外可观察的源选中键集合。
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
    event: MouseEvent
    nextSelectedKeys: TreeKey[]
  }) => {
    emit('update:selectedKeys', nextSelectedKeys)
    emit('select', nextSelectedKeys, {
      selected: nextSelectedKeys.includes(node.key),
      node: createTreeEventNode({ node }),
      /**
       * `selectedNodes` 返回的是事件层 `TreeNode[]`，不是原始 `TreeData[]`。
       *
       * 这里先说明两个中间量的职责：
       * - `nextSelectedKeys`：本次选中变更完成后，准备通过 `update:selectedKeys` / `select`
       *   对外公布的最新选中 key 集合。单选阶段它要么是 `[]`，要么只包含 1 个 key。
       * - `keyNodeMap`：树标准化阶段建立的索引表，结构是 `key -> TreeNodeModel`。
       *   它的作用是根据节点 key O(1) 反查内部节点模型，避免每次发事件都去递归遍历整棵树。
       *
       * 这里的链式调用分 3 步：
       * 1. 先根据最新的 `nextSelectedKeys`，从 `keyNodeMap` 里取出对应的内部节点模型
       *    `TreeNodeModel`。之所以先查索引，而不是直接复用原始数据，是因为事件对象需要
       *    带上层级、父子关系、selectable 等树上下文信息，而这些信息都在标准化后的
       *    `TreeNodeModel` 上。
       * 2. 过滤掉查索引失败的 key。正常情况下阶段 4 的单选逻辑已经做过 key 归一化，
       *    这里仍保留一次防御性过滤，避免数据在事件发出前发生变化时把 `undefined`
       *    带进后续映射。
       * 3. 把内部 `TreeNodeModel` 转成对外暴露的事件节点 `TreeNode`。这样 `select`
       *    事件里的 `node` 和 `selectedNodes` 会保持同一层语义，业务侧如果需要原始数据，
       *    可以统一通过 `eventNode.data` 读取。
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
   * 单选规则：
   * 1. 点击未选中节点时切换为唯一选中；
   * 2. 再次点击当前选中节点时清空选中。
   */
  const selectNode = ({ node, event }: SelectNodeOptions) => {
    if (!canSelectNode(node)) {
      return
    }

    const currentSelectedKeys = getCurrentSelectedKeys()
    const nextSelectedKeys = currentSelectedKeys.includes(node.key) ? [] : [node.key]

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
    [treeIndex, isControlled, isTreeSelectable],
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
