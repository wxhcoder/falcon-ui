import { computed, ref, watch, type ComputedRef } from 'vue'
import type { TreeIndex, TreeKey, TreeNodeModel } from './tree'

interface UseTreeKeyboardStateOptions {
  treeIndex: ComputedRef<TreeIndex>
  selectedKeys: ComputedRef<TreeKey[]>
  isNodeExpanded: (nodeKey: TreeKey) => boolean
  isNodeExpandable: (node: TreeNodeModel) => boolean
}

let treeIdSeed = 0

const createTreeId = () => {
  treeIdSeed += 1
  return `fl-tree-${treeIdSeed}`
}

const encodeTreeKey = (key: TreeKey) => encodeURIComponent(String(key))

const createTreeNodeId = (treeId: string, key: TreeKey) =>
  `${treeId}-node-${typeof key}-${encodeTreeKey(key)}`

export const useTreeKeyboardState = ({
  treeIndex,
  selectedKeys,
  isNodeExpanded,
  isNodeExpandable
}: UseTreeKeyboardStateOptions) => {
  const treeId = createTreeId()
  const focusedKey = ref<TreeKey>()

  const visibleNodeKeys = computed(() => {
    const nextVisibleNodeKeys: TreeKey[] = []

    const visit = (nodes: TreeNodeModel[]) => {
      for (const node of nodes) {
        nextVisibleNodeKeys.push(node.key)

        if (isNodeExpandable(node) && isNodeExpanded(node.key)) {
          visit(node.childNodes)
        }
      }
    }

    visit(treeIndex.value.nodes)

    return nextVisibleNodeKeys
  })

  const visibleNodeKeySet = computed(() => new Set<TreeKey>(visibleNodeKeys.value))

  const getNodeId = (nodeKey: TreeKey) => createTreeNodeId(treeId, nodeKey)

  const activeDescendantId = computed(() =>
    focusedKey.value === undefined ? undefined : getNodeId(focusedKey.value)
  )

  const getFocusedNode = () =>
    focusedKey.value === undefined ? undefined : treeIndex.value.keyNodeMap.get(focusedKey.value)

  const isNodeFocused = (nodeKey: TreeKey) => focusedKey.value === nodeKey

  const focusNode = (nodeKey: TreeKey) => {
    if (!treeIndex.value.keyNodeMap.has(nodeKey)) {
      return
    }

    focusedKey.value = nodeKey
  }

  const findVisibleAncestorKey = (nodeKey: TreeKey) => {
    let currentNode = treeIndex.value.keyNodeMap.get(nodeKey)?.parent ?? null

    while (currentNode) {
      if (visibleNodeKeySet.value.has(currentNode.key)) {
        return currentNode.key
      }

      currentNode = currentNode.parent
    }

    return undefined
  }

  const findInitialFocusedKey = () => {
    const selectedVisibleKey = selectedKeys.value.find((key) => visibleNodeKeySet.value.has(key))

    return selectedVisibleKey ?? visibleNodeKeys.value[0]
  }

  const syncFocusedKey = () => {
    if (visibleNodeKeys.value.length === 0) {
      focusedKey.value = undefined
      return
    }

    if (focusedKey.value !== undefined && visibleNodeKeySet.value.has(focusedKey.value)) {
      return
    }

    focusedKey.value =
      focusedKey.value === undefined
        ? findInitialFocusedKey()
        : (findVisibleAncestorKey(focusedKey.value) ?? findInitialFocusedKey())
  }

  const moveFocusBy = (offset: number) => {
    if (visibleNodeKeys.value.length === 0) {
      focusedKey.value = undefined
      return
    }

    const currentIndex =
      focusedKey.value === undefined ? -1 : visibleNodeKeys.value.indexOf(focusedKey.value)
    const fallbackIndex = offset > 0 ? 0 : visibleNodeKeys.value.length - 1
    const nextIndex =
      currentIndex === -1
        ? fallbackIndex
        : Math.min(Math.max(currentIndex + offset, 0), visibleNodeKeys.value.length - 1)

    focusedKey.value = visibleNodeKeys.value[nextIndex]
  }

  const moveFocusToParent = (node: TreeNodeModel) => {
    if (node.parent) {
      focusedKey.value = node.parent.key
    }
  }

  const moveFocusToFirstChild = (node: TreeNodeModel) => {
    const firstVisibleChild = node.childNodes.find((childNode) =>
      visibleNodeKeySet.value.has(childNode.key)
    )

    if (firstVisibleChild) {
      focusedKey.value = firstVisibleChild.key
    }
  }

  watch([visibleNodeKeys, visibleNodeKeySet, selectedKeys], syncFocusedKey, {
    immediate: true
  })

  return {
    activeDescendantId,
    focusNode,
    focusedKey,
    getFocusedNode,
    getNodeId,
    isNodeFocused,
    moveFocusBy,
    moveFocusToFirstChild,
    moveFocusToParent,
    visibleNodeKeys
  }
}
