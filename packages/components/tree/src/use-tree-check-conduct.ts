import {
  isTreeCheckedKeysObject,
  isTreeKey,
  type TreeCheckedKeys,
  type TreeIndex,
  type TreeKey,
  type TreeNodeModel
} from './tree'

/**
 * 勾选状态统一拆分为 checked / halfChecked 两套集合，便于默认联动与严格模式复用。
 */
export interface TreeCheckedState {
  checkedKeys: TreeKey[]
  halfCheckedKeys: TreeKey[]
}

type TreeConductState = 'full' | 'partial' | 'none' | 'skip'

/**
 * 判断节点自身是否允许渲染复选框并进入勾选结果。
 */
const isNodeCheckable = (node: TreeNodeModel) => node.checkboxVisible

/**
 * 按树的可见遍历顺序输出 key，保证勾选与半选结果稳定。
 */
const orderTreeKeys = (keySet: Set<TreeKey>, treeIndex: TreeIndex) =>
  treeIndex.visibleNodeKeys.filter((key) => keySet.has(key))

/**
 * 归一化勾选 key：
 * 1. 过滤非法 / 不存在节点
 * 2. 去重
 * 3. 过滤 `hiddenCheckboxKeys`
 * 4. 保留 `disabledKeys` / `disabledCheckboxKeys`，以支持受控展示
 */
const normalizeTreeCheckedKeyList = (
  keys: TreeKey[] | undefined,
  treeIndex: TreeIndex
): TreeKey[] => {
  if (!Array.isArray(keys)) {
    return []
  }

  const normalizedKeys: TreeKey[] = []
  const visitedKeys = new Set<TreeKey>()

  for (const key of keys) {
    if (!isTreeKey(key) || visitedKeys.has(key)) {
      continue
    }

    const node = treeIndex.keyNodeMap.get(key)

    if (!node || !isNodeCheckable(node)) {
      continue
    }

    visitedKeys.add(key)
    normalizedKeys.push(key)
  }

  return normalizedKeys
}

/**
 * 严格模式下的 `halfChecked` 由外部直接控制，但不能与 `checked` 重复。
 */
const normalizeStrictHalfCheckedKeys = (
  keys: TreeKey[] | undefined,
  checkedKeys: TreeKey[],
  treeIndex: TreeIndex
) => {
  const checkedKeySet = new Set<TreeKey>(checkedKeys)

  return normalizeTreeCheckedKeyList(keys, treeIndex).filter((key) => !checkedKeySet.has(key))
}

/**
 * 从树节点向下收集当前联动分支内所有可进入勾选结果的 key。
 * `disabledKeys` 是硬边界；`hiddenCheckboxKeys` 只跳过自身，不阻断对子孙的遍历。
 */
const collectConductBranchKeys = (node: TreeNodeModel) => {
  const branchKeySet = new Set<TreeKey>()

  const visit = (currentNode: TreeNodeModel) => {
    if (currentNode.disabled) {
      return
    }

    if (isNodeCheckable(currentNode)) {
      branchKeySet.add(currentNode.key)
    }

    for (const childNode of currentNode.childNodes) {
      visit(childNode)
    }
  }

  visit(node)

  return branchKeySet
}

/**
 * 取消联动勾选时，需要同步清理当前节点可达链路上的可勾选祖先。
 * `disabled` 祖先是硬边界，不再继续向上清理。
 */
const collectConductAncestorKeys = (node: TreeNodeModel) => {
  const ancestorKeySet = new Set<TreeKey>()
  let currentParent = node.parent

  while (currentParent) {
    if (currentParent.disabled) {
      break
    }

    if (isNodeCheckable(currentParent)) {
      ancestorKeySet.add(currentParent.key)
    }

    currentParent = currentParent.parent
  }

  return ancestorKeySet
}

/**
 * 从显式勾选 key 出发执行向下传导，得到用于后续半选计算的中间结果。
 */
const createConductedCheckedKeySet = (sourceCheckedKeys: TreeKey[], treeIndex: TreeIndex) => {
  const conductedCheckedKeySet = new Set<TreeKey>()

  for (const key of normalizeTreeCheckedKeyList(sourceCheckedKeys, treeIndex)) {
    const node = treeIndex.keyNodeMap.get(key)

    if (!node) {
      continue
    }

    if (node.disabled) {
      conductedCheckedKeySet.add(node.key)
      continue
    }

    for (const branchKey of collectConductBranchKeys(node)) {
      conductedCheckedKeySet.add(branchKey)
    }
  }

  return conductedCheckedKeySet
}

/**
 * 自底向上计算最终 checked / halfChecked：
 * 1. `disabled` 节点只保留自身受控状态，并阻断向父级的贡献
 * 2. 隐藏 checkbox 的节点作为透明桥接层，只透传子孙勾选结果
 */
const createConductedTreeCheckedState = (
  sourceCheckedKeySet: Set<TreeKey>,
  treeIndex: TreeIndex
): TreeCheckedState => {
  const checkedKeySet = new Set<TreeKey>()
  const halfCheckedKeySet = new Set<TreeKey>()

  const visit = (node: TreeNodeModel): TreeConductState => {
    if (node.disabled) {
      for (const childNode of node.childNodes) {
        visit(childNode)
      }

      if (isNodeCheckable(node) && sourceCheckedKeySet.has(node.key)) {
        checkedKeySet.add(node.key)
      }

      return 'skip'
    }

    const childStates = node.childNodes
      .map((childNode) => visit(childNode))
      .filter((state) => state !== 'skip')
    const hasReachableChildren = childStates.length > 0
    const allChildrenChecked =
      hasReachableChildren && childStates.every((state) => state === 'full')
    const hasCheckedDescendant = childStates.some(
      (state) => state === 'full' || state === 'partial'
    )
    const selfChecked = isNodeCheckable(node) && sourceCheckedKeySet.has(node.key)

    if (!isNodeCheckable(node)) {
      if (allChildrenChecked) {
        return 'full'
      }

      if (hasCheckedDescendant) {
        return 'partial'
      }

      return 'skip'
    }

    if (hasReachableChildren && allChildrenChecked) {
      checkedKeySet.add(node.key)
      return 'full'
    }

    if (hasCheckedDescendant) {
      halfCheckedKeySet.add(node.key)
      return 'partial'
    }

    if (selfChecked) {
      checkedKeySet.add(node.key)
      return 'full'
    }

    return 'none'
  }

  for (const node of treeIndex.nodes) {
    visit(node)
  }

  return {
    checkedKeys: orderTreeKeys(checkedKeySet, treeIndex),
    halfCheckedKeys: orderTreeKeys(halfCheckedKeySet, treeIndex)
  }
}

/**
 * 默认联动模式下，对输入数组执行父子传导与半选态计算。
 */
export const conductTreeCheckedState = (
  sourceCheckedKeys: TreeKey[] | undefined,
  treeIndex: TreeIndex
): TreeCheckedState =>
  createConductedTreeCheckedState(
    createConductedCheckedKeySet(sourceCheckedKeys ?? [], treeIndex),
    treeIndex
  )

/**
 * 严格模式下，`checked` 与 `halfChecked` 仅做归一化，不自动联动。
 */
export const normalizeStrictTreeCheckedState = (
  checkedKeys: TreeCheckedKeys | undefined,
  treeIndex: TreeIndex
): TreeCheckedState => {
  const normalizedCheckedKeys = normalizeTreeCheckedKeyList(
    isTreeCheckedKeysObject(checkedKeys) ? checkedKeys.checked : checkedKeys,
    treeIndex
  )
  const normalizedHalfCheckedKeys = isTreeCheckedKeysObject(checkedKeys)
    ? normalizeStrictHalfCheckedKeys(checkedKeys.halfChecked, normalizedCheckedKeys, treeIndex)
    : []

  return {
    checkedKeys: normalizedCheckedKeys,
    halfCheckedKeys: normalizedHalfCheckedKeys
  }
}

/**
 * 统一归一化当前模式下的勾选状态。
 */
export const normalizeTreeCheckedState = ({
  checkedKeys,
  treeIndex,
  strict
}: {
  checkedKeys: TreeCheckedKeys | undefined
  treeIndex: TreeIndex
  strict: boolean
}): TreeCheckedState =>
  strict
    ? normalizeStrictTreeCheckedState(checkedKeys, treeIndex)
    : conductTreeCheckedState(
        isTreeCheckedKeysObject(checkedKeys) ? checkedKeys.checked : checkedKeys,
        treeIndex
      )

/**
 * 默认联动模式下切换某个节点的勾选状态：
 * 1. 勾选时选中当前节点及其可达子孙
 * 2. 取消时移除当前节点、其可达子孙以及沿途可勾选祖先
 * 3. 之后重新执行传导，生成新的 checked / halfChecked 结果
 */
export const toggleConductedTreeCheckedState = ({
  node,
  checkedKeys,
  treeIndex
}: {
  node: TreeNodeModel
  checkedKeys: TreeKey[]
  treeIndex: TreeIndex
}): TreeCheckedState => {
  const nextCheckedKeySet = new Set<TreeKey>(checkedKeys)
  const branchKeySet = collectConductBranchKeys(node)

  if (nextCheckedKeySet.has(node.key)) {
    for (const key of branchKeySet) {
      nextCheckedKeySet.delete(key)
    }

    for (const key of collectConductAncestorKeys(node)) {
      nextCheckedKeySet.delete(key)
    }
  } else {
    for (const key of branchKeySet) {
      nextCheckedKeySet.add(key)
    }
  }

  return conductTreeCheckedState(Array.from(nextCheckedKeySet), treeIndex)
}

/**
 * 将当前模式下的勾选状态编码回对外值形态。
 */
export const createTreeCheckedKeysValue = ({
  strict,
  checkedKeys,
  halfCheckedKeys
}: {
  strict: boolean
  checkedKeys: TreeKey[]
  halfCheckedKeys: TreeKey[]
}): TreeCheckedKeys =>
  strict
    ? {
        checked: checkedKeys,
        halfChecked: halfCheckedKeys
      }
    : checkedKeys
