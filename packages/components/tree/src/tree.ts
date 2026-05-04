import { Loading } from '@element-plus/icons-vue'
import type { Component, ComponentPublicInstance, ExtractPublicPropTypes, PropType } from 'vue'
import type {
  TreeClassNames as TreeClassNamesSource,
  TreeClassValue,
  TreeData,
  TreeIndex,
  TreeKey,
  TreeNode,
  TreeNodeModel,
  TreeNodeProps,
  TreeSemanticDOM,
  TreeSemanticInfo,
  TreeSemanticRecord,
  TreeSwitcherIconMode,
  TreeStyles as TreeStylesSource
} from './tree-types'

export interface TreeCheckedKeysObject {
  checked: TreeKey[]
  halfChecked: TreeKey[]
}

export type TreeCheckedKeys = TreeKey[] | TreeCheckedKeysObject

export type TreeLoadData = (node: TreeNode) => Promise<unknown>

export type TreeSwitcherLoadingIcon = Component

/**
 * 首版使用稳定的默认字段映射，保证常规树数据可直接渲染。
 */
export const treeNodePropsDefaults: Required<TreeNodeProps> = {
  label: 'label',
  children: 'children',
  disabled: 'disabled',
  isLeaf: 'isLeaf',
  class: 'class'
}

/**
 * 阶段 3 在基础树结构之外，正式开放默认展开与受控展开相关契约。
 */
export const treeProps = {
  data: {
    type: Array as PropType<TreeData[]>,
    default: () => []
  },
  showLine: {
    type: Boolean,
    default: false
  },
  switcherIcon: {
    type: String as PropType<TreeSwitcherIconMode>,
    default: 'arrow'
  },
  switcherLoadingIcon: {
    type: [Object, Function] as PropType<TreeSwitcherLoadingIcon>,
    default: Loading
  },
  selectable: {
    type: Boolean,
    default: true
  },
  multiple: {
    type: Boolean,
    default: false
  },
  checkable: {
    type: Boolean,
    default: false
  },
  checkStrictly: {
    type: Boolean,
    default: false
  },
  props: {
    type: Object as PropType<TreeNodeProps>,
    default: () => ({ ...treeNodePropsDefaults })
  },
  classNames: {
    type: [Object, Function] as PropType<TreeClassNamesSource>
  },
  styles: {
    type: [Object, Function] as PropType<TreeStylesSource>
  },
  defaultExpandAll: {
    type: Boolean,
    default: false
  },
  defaultExpandedKeys: {
    type: Array as PropType<TreeKey[] | undefined>,
    default: undefined
  },
  expandedKeys: {
    type: Array as PropType<TreeKey[] | undefined>,
    default: undefined
  },
  autoExpandParent: {
    type: Boolean,
    default: false
  },
  defaultExpandParent: {
    type: Boolean,
    default: true
  },
  defaultSelectedKeys: {
    type: Array as PropType<TreeKey[] | undefined>,
    default: undefined
  },
  selectedKeys: {
    type: Array as PropType<TreeKey[] | undefined>,
    default: undefined
  },
  defaultCheckedKeys: {
    type: Array as PropType<TreeKey[] | undefined>,
    default: undefined
  },
  checkedKeys: {
    type: [Array, Object] as PropType<TreeCheckedKeys | undefined>,
    default: undefined
  },
  loadData: {
    type: Function as PropType<TreeLoadData | undefined>,
    default: undefined
  },
  loadedKeys: {
    type: Array as PropType<TreeKey[] | undefined>,
    default: undefined
  }
} as const

export type TreeProps = ExtractPublicPropTypes<typeof treeProps>

export type TreeClassNames = TreeClassNamesSource<TreeProps>

export type TreeStyles = TreeStylesSource<TreeProps>

/**
 * 树节点展开事件统一返回本次节点状态与当前源展开键集合。
 */
export interface TreeExpandPayload {
  expanded: boolean
  node: TreeData
  key: TreeKey
  expandedKeys: TreeKey[]
}

/**
 * 树节点选中事件统一返回当前节点结果与最新选中集合。
 */
export interface TreeSelectEvent {
  selected: boolean
  node: TreeNode
  selectedNodes: TreeNode[]
  key: TreeKey
  event: MouseEvent
}

/**
 * 树节点勾选事件统一返回当前节点结果与最新勾选集合。
 */
export interface TreeCheckEvent {
  checked: boolean
  node: TreeNode
  checkedNodes: TreeNode[]
  halfCheckedKeys: TreeKey[]
  key: TreeKey
  event: MouseEvent
}

/**
 * 树节点异步加载完成事件统一返回当前节点与最新已加载键集合。
 */
export interface TreeLoadEvent {
  node: TreeNode
  key: TreeKey
  loadedKeys: TreeKey[]
}

/**
 * 节点组件实例通过 Vue public instance 向外暴露。
 */
export type TreeNodeInstance = ComponentPublicInstance | null

/**
 * `node-click` 事件固定采用 Element Plus 风格的多参数出参。
 */
export type TreeNodeClickArgs = [
  data: TreeData,
  node: TreeNode,
  component: TreeNodeInstance,
  event: MouseEvent
]

/**
 * `node-expand` / `node-collapse` 事件固定采用 Element Plus 风格的多参数出参。
 */
export type TreeNodeToggleArgs = [
  data: TreeData,
  node: TreeNode & { expanded: boolean },
  instance: TreeNodeInstance
]

/**
 * `select` 事件固定采用双参数出参。
 */
export type TreeSelectArgs = [selectedKeys: TreeKey[], event: TreeSelectEvent]

/**
 * `check` 事件固定采用双参数出参。
 */
export type TreeCheckArgs = [checkedKeys: TreeCheckedKeys, event: TreeCheckEvent]

/**
 * `load` 事件固定采用双参数出参。
 */
export type TreeLoadArgs = [loadedKeys: TreeKey[], event: TreeLoadEvent]

/**
 * 判断当前值是否为普通对象。
 */
const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object'

/**
 * 判断当前值是否为树组件允许使用的节点键类型。
 */
export const isTreeKey = (value: unknown): value is TreeKey =>
  typeof value === 'string' || typeof value === 'number'

/**
 * 判断当前值是否为 `{ checked, halfChecked }` 形态的勾选结果对象。
 */
export const isTreeCheckedKeysObject = (value: unknown): value is TreeCheckedKeysObject =>
  isRecord(value) &&
  Array.isArray(value.checked) &&
  value.checked.every((item) => isTreeKey(item)) &&
  Array.isArray(value.halfChecked) &&
  value.halfChecked.every((item) => isTreeKey(item))

/**
 * 判断当前值是否满足树组件允许的勾选结果输入形态。
 */
export const isTreeCheckedKeys = (value: unknown): value is TreeCheckedKeys =>
  (Array.isArray(value) && value.every((item) => isTreeKey(item))) || isTreeCheckedKeysObject(value)

/**
 * 判断当前值是否为树节点组件实例。
 */
const isTreeNodeInstance = (value: unknown): value is TreeNodeInstance =>
  value === null || isRecord(value)

/**
 * 判断当前值是否满足对外节点对象的最小结构。
 */
const isTreeNode = (value: unknown): value is TreeNode =>
  isRecord(value) &&
  isTreeKey(value.key) &&
  typeof value.level === 'number' &&
  typeof value.label === 'string' &&
  typeof value.disabled === 'boolean' &&
  typeof value.disableCheckbox === 'boolean' &&
  typeof value.checkable === 'boolean' &&
  typeof value.selectable === 'boolean' &&
  typeof value.isLeaf === 'boolean' &&
  Array.isArray(value.childNodes) &&
  'data' in value

/**
 * 验证 `node-click` 事件的四元组参数。
 */
const isTreeNodeClickArgs = (
  data: TreeData,
  node: TreeNode,
  component: TreeNodeInstance,
  event: MouseEvent
) =>
  isRecord(data) &&
  isTreeNode(node) &&
  isTreeNodeInstance(component) &&
  isRecord(event) &&
  typeof event.type === 'string'

/**
 * 验证 `node-expand` / `node-collapse` 事件的三元组参数。
 */
const isTreeNodeToggleArgs = (
  data: TreeData,
  node: TreeNode & { expanded: boolean },
  instance: TreeNodeInstance
) =>
  isRecord(data) &&
  isTreeNode(node) &&
  typeof node.expanded === 'boolean' &&
  isTreeNodeInstance(instance)

/**
 * 验证 `select` 事件的双元组参数。
 */
const isTreeSelectArgs = (selectedKeys: TreeKey[], event: TreeSelectEvent) =>
  Array.isArray(selectedKeys) &&
  selectedKeys.every((item) => isTreeKey(item)) &&
  typeof event.selected === 'boolean' &&
  isTreeKey(event.key) &&
  isTreeNode(event.node) &&
  Array.isArray(event.selectedNodes) &&
  event.selectedNodes.every((item) => isTreeNode(item)) &&
  isRecord(event.event) &&
  typeof event.event.type === 'string'

/**
 * 验证 `check` 事件的双元组参数。
 */
const isTreeCheckArgs = (checkedKeys: TreeCheckedKeys, event: TreeCheckEvent) =>
  isTreeCheckedKeys(checkedKeys) &&
  typeof event.checked === 'boolean' &&
  isTreeKey(event.key) &&
  isTreeNode(event.node) &&
  Array.isArray(event.checkedNodes) &&
  event.checkedNodes.every((item) => isTreeNode(item)) &&
  Array.isArray(event.halfCheckedKeys) &&
  event.halfCheckedKeys.every((item) => isTreeKey(item)) &&
  isRecord(event.event) &&
  typeof event.event.type === 'string'

/**
 * 验证 `load` 事件的双元组参数。
 */
const isTreeLoadArgs = (loadedKeys: TreeKey[], event: TreeLoadEvent) =>
  Array.isArray(loadedKeys) &&
  loadedKeys.every((item) => isTreeKey(item)) &&
  isTreeKey(event.key) &&
  isTreeNode(event.node) &&
  Array.isArray(event.loadedKeys) &&
  event.loadedKeys.every((item) => isTreeKey(item))

/**
 * 阶段 3 正式开放展开状态双向同步与展开事件。
 */
export const treeEmits = {
  /**
   * 请求外部同步当前源展开键集合。
   */
  'update:expandedKeys': (value: TreeKey[]) =>
    Array.isArray(value) && value.every((item) => isTreeKey(item)),
  /**
   * 请求外部同步当前源选中键集合。
   */
  'update:selectedKeys': (value: TreeKey[]) =>
    Array.isArray(value) && value.every((item) => isTreeKey(item)),
  /**
   * 请求外部同步当前源勾选键集合。
   */
  'update:checkedKeys': (value: TreeCheckedKeys) => isTreeCheckedKeys(value),
  /**
   * 请求外部同步当前已完成异步加载的节点键集合。
   */
  'update:loadedKeys': (value: TreeKey[]) =>
    Array.isArray(value) && value.every((item) => isTreeKey(item)),
  /**
   * 节点展开状态切换后抛出当前节点的展开结果。
   */
  expand: (payload: TreeExpandPayload) =>
    typeof payload.expanded === 'boolean' &&
    isTreeKey(payload.key) &&
    Array.isArray(payload.expandedKeys) &&
    payload.expandedKeys.every((item) => isTreeKey(item)) &&
    payload.node !== null &&
    typeof payload.node === 'object',
  /**
   * 节点被点击时抛出节点数据、节点对象、组件实例与鼠标事件。
   */
  'node-click': (...args: TreeNodeClickArgs) => isTreeNodeClickArgs(...args),
  /**
   * 节点被选中或取消选中时抛出最新选中结果。
   */
  select: (...args: TreeSelectArgs) => isTreeSelectArgs(...args),
  /**
   * 节点复选框勾选状态切换后抛出当前勾选结果。
   */
  check: (...args: TreeCheckArgs) => isTreeCheckArgs(...args),
  /**
   * 节点异步加载完成后抛出最新已加载结果。
   */
  load: (...args: TreeLoadArgs) => isTreeLoadArgs(...args),
  /**
   * 节点被用户展开时抛出切换后的节点对象与组件实例。
   */
  'node-expand': (...args: TreeNodeToggleArgs) => isTreeNodeToggleArgs(...args),
  /**
   * 节点被用户收起时抛出切换后的节点对象与组件实例。
   */
  'node-collapse': (...args: TreeNodeToggleArgs) => isTreeNodeToggleArgs(...args)
} as const

export type TreeEmits = typeof treeEmits

/**
 * 将用户传入的部分映射与默认映射合并，统一生成内部字段配置。
 */
export const resolveTreeNodePropsConfig = (
  propsConfig?: TreeNodeProps
): Required<TreeNodeProps> => ({
  ...treeNodePropsDefaults,
  ...propsConfig
})

/**
 * 按映射字段名读取原始节点字段，避免字段读取逻辑散落在各处。
 */
const readTreeField = (node: TreeData, fieldName: string): unknown => node[fieldName]

/**
 * 将任意合法 class 值归一化为 Vue 可直接绑定的形式。
 */
const resolveNodeClassName = (value: unknown): TreeClassValue => {
  if (Array.isArray(value)) {
    return value as string[]
  }

  if (value === null) {
    return undefined
  }

  if (
    typeof value === 'string' ||
    value === undefined ||
    (value !== null && typeof value === 'object')
  ) {
    return value as TreeClassValue
  }

  return String(value)
}

/**
 * 将单个原始节点转换为内部标准化节点。
 */
export const normalizeTreeNode = (
  rawNode: TreeData,
  level: number,
  propsConfig?: TreeNodeProps,
  parent: TreeNodeModel | null = null,
  isLastSibling = true,
  lineTrackEnds: boolean[] = []
): TreeNodeModel => {
  const mappedProps = resolveTreeNodePropsConfig(propsConfig)
  const childrenValue = readTreeField(rawNode, mappedProps.children)
  const childNodes = Array.isArray(childrenValue) ? (childrenValue as TreeData[]) : []

  const labelValue = readTreeField(rawNode, mappedProps.label)
  const disabledValue = readTreeField(rawNode, mappedProps.disabled)
  const isLeafValue = readTreeField(rawNode, mappedProps.isLeaf)
  const classValue = readTreeField(rawNode, mappedProps.class)

  if (rawNode.key === undefined || rawNode.key === null) {
    throw new Error('[FlTree] Every node must provide a unique `key`.')
  }

  const treeNode: TreeNodeModel = {
    key: rawNode.key,
    level,
    data: rawNode,
    label: labelValue == null ? '' : String(labelValue),
    disabled: Boolean(disabledValue),
    disableCheckbox: Boolean(rawNode.disableCheckbox),
    checkable: rawNode.checkable !== false,
    selectable: rawNode.selectable !== false,
    isLeaf: Boolean(isLeafValue),
    className: resolveNodeClassName(classValue),
    isLastSibling,
    lineTrackEnds,
    parent,
    childNodes: []
  }

  treeNode.childNodes = childNodes.map((childNode, index) =>
    normalizeTreeNode(
      childNode,
      level + 1,
      mappedProps,
      treeNode,
      index === childNodes.length - 1,
      [...lineTrackEnds, isLastSibling]
    )
  )

  return treeNode
}

/**
 * 在递归树结构之外，同时建立扁平索引，供后续阶段复用。
 */
export const buildTreeIndex = (data: TreeData[], propsConfig?: TreeNodeProps): TreeIndex => {
  const keyNodeMap = new Map<TreeKey, TreeNodeModel>()
  const parentKeyMap = new Map<TreeKey, TreeKey | null>()
  const childrenKeyMap = new Map<TreeKey, TreeKey[]>()
  const visibleNodeKeys: TreeKey[] = []
  const normalizedNodes = data.map((node, index) =>
    normalizeTreeNode(node, 1, propsConfig, null, index === data.length - 1)
  )

  /**
   * 递归遍历标准化节点，并同步填充索引表。
   */
  const visit = (nodes: TreeNodeModel[], parentKey: TreeKey | null) => {
    for (const node of nodes) {
      if (keyNodeMap.has(node.key)) {
        throw new Error(`[FlTree] Duplicate node key detected: ${String(node.key)}`)
      }

      keyNodeMap.set(node.key, node)
      parentKeyMap.set(node.key, parentKey)
      visibleNodeKeys.push(node.key)
      childrenKeyMap.set(
        node.key,
        node.childNodes.map((childNode) => childNode.key)
      )

      if (node.childNodes.length > 0) {
        visit(node.childNodes, node.key)
      }
    }
  }

  visit(normalizedNodes, null)

  return {
    nodes: normalizedNodes,
    keyNodeMap,
    parentKeyMap,
    childrenKeyMap,
    visibleNodeKeys
  }
}

/**
 * 过滤无效、重复或已从树结构中移除的展开键。
 */
export const filterTreeExpandedKeys = (
  keys: TreeKey[] | undefined,
  keyNodeMap: Map<TreeKey, TreeNodeModel>
): TreeKey[] => {
  if (!Array.isArray(keys)) {
    return []
  }

  const nextExpandedKeys: TreeKey[] = []
  const visitedKeys = new Set<TreeKey>()

  for (const key of keys) {
    if (!isTreeKey(key) || visitedKeys.has(key) || !keyNodeMap.has(key)) {
      continue
    }

    visitedKeys.add(key)
    nextExpandedKeys.push(key)
  }

  return nextExpandedKeys
}

/**
 * 过滤无效、重复或已从树结构中移除的选中键。
 */
export const filterTreeSelectedKeys = (
  keys: TreeKey[] | undefined,
  keyNodeMap: Map<TreeKey, TreeNodeModel>
): TreeKey[] => {
  if (!Array.isArray(keys)) {
    return []
  }

  const nextSelectedKeys: TreeKey[] = []
  const visitedKeys = new Set<TreeKey>()

  for (const key of keys) {
    if (!isTreeKey(key) || visitedKeys.has(key) || !keyNodeMap.has(key)) {
      continue
    }

    visitedKeys.add(key)
    nextSelectedKeys.push(key)
  }

  return nextSelectedKeys
}

/**
 * 过滤无效、重复或已从树结构中移除的勾选键。
 */
export const filterTreeCheckedKeys = (
  keys: TreeKey[] | undefined,
  keyNodeMap: Map<TreeKey, TreeNodeModel>
): TreeKey[] => {
  if (!Array.isArray(keys)) {
    return []
  }

  const nextCheckedKeys: TreeKey[] = []
  const visitedKeys = new Set<TreeKey>()

  for (const key of keys) {
    if (!isTreeKey(key) || visitedKeys.has(key) || !keyNodeMap.has(key)) {
      continue
    }

    visitedKeys.add(key)
    nextCheckedKeys.push(key)
  }

  return nextCheckedKeys
}

/**
 * 过滤无效、重复或已从树结构中移除的异步加载完成键。
 */
export const filterTreeLoadedKeys = (
  keys: TreeKey[] | undefined,
  keyNodeMap: Map<TreeKey, TreeNodeModel>
): TreeKey[] => {
  if (!Array.isArray(keys)) {
    return []
  }

  const nextLoadedKeys: TreeKey[] = []
  const visitedKeys = new Set<TreeKey>()

  for (const key of keys) {
    if (!isTreeKey(key) || visitedKeys.has(key) || !keyNodeMap.has(key)) {
      continue
    }

    visitedKeys.add(key)
    nextLoadedKeys.push(key)
  }

  return nextLoadedKeys
}

/**
 * 清理集合中已经失效的节点键，供非受控状态在数据更新后裁剪缓存。
 */
export const pruneTreeKeySet = (
  keys: Set<TreeKey>,
  keyNodeMap: Map<TreeKey, TreeNodeModel>
): Set<TreeKey> => {
  const nextKeys = new Set<TreeKey>()

  for (const key of keys) {
    if (keyNodeMap.has(key)) {
      nextKeys.add(key)
    }
  }

  return nextKeys
}

/**
 * 收集当前树中所有可展开节点的 key，供 `defaultExpandAll` 初始化使用。
 */
export const collectExpandableTreeKeys = (nodes: TreeNodeModel[]): TreeKey[] => {
  const expandedKeys: TreeKey[] = []

  /**
   * 递归遍历存在子节点的分支节点，并记录其 key。
   */
  const visit = (currentNodes: TreeNodeModel[]) => {
    for (const node of currentNodes) {
      if (node.childNodes.length === 0) {
        continue
      }

      expandedKeys.push(node.key)
      visit(node.childNodes)
    }
  }

  visit(nodes)

  return expandedKeys
}

/**
 * 基于父节点索引补齐源展开键的全部祖先节点键。
 */
export const collectAncestorExpandedKeys = (
  sourceExpandedKeys: TreeKey[],
  parentKeyMap: Map<TreeKey, TreeKey | null>
): Set<TreeKey> => {
  const ancestorKeys = new Set<TreeKey>()

  for (const key of sourceExpandedKeys) {
    let parentKey = parentKeyMap.get(key) ?? null

    while (parentKey !== null) {
      ancestorKeys.add(parentKey)
      parentKey = parentKeyMap.get(parentKey) ?? null
    }
  }

  return ancestorKeys
}

/**
 * 根据源展开键生成最终用于渲染的展开集合，可按需补齐祖先节点。
 */
export const createEffectiveExpandedKeySet = ({
  sourceExpandedKeys,
  parentKeyMap,
  includeAncestorKeys
}: {
  sourceExpandedKeys: TreeKey[]
  parentKeyMap: Map<TreeKey, TreeKey | null>
  includeAncestorKeys: boolean
}): Set<TreeKey> => {
  const effectiveExpandedKeys = new Set<TreeKey>(sourceExpandedKeys)

  if (!includeAncestorKeys) {
    return effectiveExpandedKeys
  }

  const ancestorKeys = collectAncestorExpandedKeys(sourceExpandedKeys, parentKeyMap)

  for (const key of ancestorKeys) {
    effectiveExpandedKeys.add(key)
  }

  return effectiveExpandedKeys
}

/**
 * 根据内部节点模型构造对外事件节点对象，并按需附带展开状态。
 */
export const createTreeEventNode = ({
  node,
  resolveExpanded
}: {
  node: TreeNodeModel
  resolveExpanded?: (nodeKey: TreeKey) => boolean
}): TreeNode => {
  const cachedNodes = new Map<TreeKey, TreeNode>()

  /**
   * 递归复制节点字段，并通过缓存避免父子链循环导致的无限递归。
   */
  const visit = (currentNode: TreeNodeModel): TreeNode => {
    const cachedNode = cachedNodes.get(currentNode.key)

    if (cachedNode) {
      return cachedNode
    }

    const eventNode: TreeNode = {
      key: currentNode.key,
      level: currentNode.level,
      data: currentNode.data,
      label: currentNode.label,
      disabled: currentNode.disabled,
      disableCheckbox: currentNode.disableCheckbox,
      checkable: currentNode.checkable,
      selectable: currentNode.selectable,
      isLeaf: currentNode.isLeaf,
      parent: null,
      childNodes: []
    }

    if (resolveExpanded) {
      eventNode.expanded = resolveExpanded(currentNode.key)
    }

    cachedNodes.set(currentNode.key, eventNode)
    eventNode.parent = currentNode.parent ? visit(currentNode.parent) : null
    eventNode.childNodes = currentNode.childNodes.map((childNode) => visit(childNode))

    return eventNode
  }

  return visit(node)
}

/**
 * 统一解析对象形式和工厂函数形式的语义化记录。
 */
export const resolveTreeSemanticRecord = <T>(
  source:
    | TreeSemanticRecord<T>
    | ((info: TreeSemanticInfo<TreeProps>) => TreeSemanticRecord<T>)
    | undefined,
  info: TreeSemanticInfo<TreeProps>
): TreeSemanticRecord<T> => {
  if (typeof source === 'function') {
    return source(info) ?? {}
  }

  return source ?? {}
}

export type {
  TreeClassValue,
  TreeData,
  TreeIndex,
  TreeKey,
  TreeNode,
  TreeNodeModel,
  TreeNodeProps,
  TreeSemanticDOM,
  TreeSemanticInfo,
  TreeSemanticRecord,
  TreeSwitcherIconMode
}
