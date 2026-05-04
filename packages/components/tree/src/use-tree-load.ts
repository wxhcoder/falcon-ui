import { computed, shallowRef, watch, type ComputedRef } from 'vue'
import {
  createTreeEventNode,
  filterTreeLoadedKeys,
  pruneTreeKeySet,
  type TreeIndex,
  type TreeKey,
  type TreeLoadEvent,
  type TreeNodeModel,
  type TreeProps
} from './tree'

interface UseTreeLoadStateOptions {
  props: TreeProps
  treeIndex: ComputedRef<TreeIndex>
  emit: TreeLoadStateEmit
}

export interface TreeLoadStateEmit {
  (event: 'update:loadedKeys', value: TreeKey[]): void
  (event: 'load', loadedKeys: TreeKey[], loadEvent: TreeLoadEvent): void
}

/**
 * FlTree 阶段 13 的异步加载状态层：
 * 1. 管理受控 / 非受控 loadedKeys
 * 2. 维护节点加载中状态与重复请求保护
 * 3. 只消费 loadData 的完成 / 失败结果，不读取 resolve 值
 */
export const useTreeLoadState = ({ props, treeIndex, emit }: UseTreeLoadStateOptions) => {
  const uncontrolledLoadedKeys = shallowRef<TreeKey[]>([])
  const loadingKeySet = shallowRef(new Set<TreeKey>())

  /**
   * 显式传入 `loadedKeys` 时，组件进入受控加载完成状态。
   */
  const isControlled = computed(() => props.loadedKeys !== undefined)

  /**
   * 受控模式下直接基于外部 prop 过滤已加载键。
   */
  const controlledLoadedKeys = computed(() =>
    filterTreeLoadedKeys(props.loadedKeys, treeIndex.value.keyNodeMap)
  )

  /**
   * 返回当前模式下对外可观察的已加载键集合。
   */
  const getCurrentLoadedKeys = () =>
    isControlled.value ? controlledLoadedKeys.value : uncontrolledLoadedKeys.value

  /**
   * 裁剪非受控 loadedKeys 与 loadingKeys 中已经从树结构移除的 key。
   */
  const syncTreeLoadState = () => {
    if (!isControlled.value) {
      uncontrolledLoadedKeys.value = filterTreeLoadedKeys(
        uncontrolledLoadedKeys.value,
        treeIndex.value.keyNodeMap
      )
    }

    loadingKeySet.value = pruneTreeKeySet(loadingKeySet.value, treeIndex.value.keyNodeMap)
  }

  /**
   * 判断指定节点是否已经完成异步加载。
   */
  const isNodeLoaded = (nodeKey: TreeKey) => getCurrentLoadedKeys().includes(nodeKey)

  /**
   * 判断指定节点当前是否处于异步加载中。
   */
  const isNodeLoading = (nodeKey: TreeKey) => loadingKeySet.value.has(nodeKey)

  /**
   * 判断当前节点是否允许触发异步加载。
   */
  const canLoadNode = (node: TreeNodeModel) =>
    typeof props.loadData === 'function' &&
    !node.isLeaf &&
    !isNodeLoaded(node.key) &&
    !isNodeLoading(node.key)

  /**
   * 设置指定节点的 loading 状态。
   */
  const setNodeLoading = (nodeKey: TreeKey, loading: boolean) => {
    const nextLoadingKeySet = new Set<TreeKey>(loadingKeySet.value)

    if (loading) {
      nextLoadingKeySet.add(nodeKey)
    } else {
      nextLoadingKeySet.delete(nodeKey)
    }

    loadingKeySet.value = nextLoadingKeySet
  }

  /**
   * 成功完成加载后，在当前 loadedKeys 末尾追加本次节点。
   */
  const createNextLoadedKeys = (nodeKey: TreeKey) =>
    filterTreeLoadedKeys([...getCurrentLoadedKeys(), nodeKey], treeIndex.value.keyNodeMap)

  /**
   * 触发节点异步加载。组件只等待 Promise 状态，不消费 resolve 值。
   */
  const loadNode = async (node: TreeNodeModel) => {
    if (!canLoadNode(node) || typeof props.loadData !== 'function') {
      return
    }

    setNodeLoading(node.key, true)

    try {
      await props.loadData(createTreeEventNode({ node }))

      const nextLoadedKeys = createNextLoadedKeys(node.key)
      const loadedNode = treeIndex.value.keyNodeMap.get(node.key) ?? node

      if (!isControlled.value) {
        uncontrolledLoadedKeys.value = nextLoadedKeys
      }

      emit('update:loadedKeys', nextLoadedKeys)
      emit('load', nextLoadedKeys, {
        node: createTreeEventNode({ node: loadedNode }),
        key: node.key,
        loadedKeys: nextLoadedKeys
      })
    } catch {
      /**
       * 失败态由业务侧在 loadData 内处理；组件保持节点可重试。
       */
    } finally {
      setNodeLoading(node.key, false)
    }
  }

  watch([treeIndex, isControlled], syncTreeLoadState, { immediate: true })

  return {
    isControlled,
    isNodeLoaded,
    isNodeLoading,
    loadNode,
    loadedKeys: computed(getCurrentLoadedKeys)
  }
}
