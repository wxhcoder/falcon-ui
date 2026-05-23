/**
 * 树节点主键仅允许字符串或数字，避免首版引入额外的键值归一成本。
 */
export type TreeKey = string | number

/**
 * 展开器视觉模式在阶段 11 固定为三档枚举，后续异步加载阶段可复用同一模式定义。
 */
export type TreeSwitcherIconMode = 'arrow' | 'plus-minus' | 'folder'

export interface TreeShowLineOptions {
  showLeafIcon?: boolean
}

export type TreeShowLine = boolean | TreeShowLineOptions

/**
 * 原始树节点允许保留业务字段，但 `key` 始终是必填字段。
 */
export interface TreeData {
  key: TreeKey
  children?: TreeData[]
  isLeaf?: boolean
  [key: string]: unknown
}

/**
 * 字段映射只负责把业务数据结构转换为树节点结构。
 */
export interface TreeNodeProps {
  label?: string
  children?: string
  isLeaf?: string
}

/**
 * 语义化 DOM 名称仅覆盖 Tree 自身长期稳定持有的外壳结构。
 */
export type TreeSemanticDOM = 'root' | 'item'

/**
 * 语义化记录同时服务于 `classNames` 与 `styles`。
 */
export type TreeSemanticRecord<T> = Partial<Record<TreeSemanticDOM, T>>

/**
 * 支持字符串、数组和对象三种 Vue class 绑定形式。
 */
export type TreeClassValue = string | string[] | Record<string, boolean>

/**
 * 标准化节点是内部递归渲染骨架使用的统一结构。
 */
export interface TreeNodeModel {
  key: TreeKey
  level: number
  data: TreeData
  label: string
  disabled: boolean
  selectable: boolean
  checkboxDisabled: boolean
  checkboxVisible: boolean
  isLeaf: boolean
  isLastSibling: boolean
  lineTrackEnds: boolean[]
  parent: TreeNodeModel | null
  childNodes: TreeNodeModel[]
}

/**
 * 对外事件中的节点对象按字段级兼容 Element Plus Node。
 */
export interface TreeNode {
  key: TreeKey
  level: number
  data: TreeData
  label: string
  disabled: boolean
  selectable: boolean
  checkboxDisabled: boolean
  checkboxVisible: boolean
  isLeaf: boolean
  parent: TreeNode | null
  childNodes: TreeNode[]
}

export interface TreeNodeClassNameInfo {
  node: TreeNode
  data: TreeData
}

export type TreeNodeClassName = (info: TreeNodeClassNameInfo) => TreeClassValue | undefined

/**
 * 树索引为后续展开、选择、勾选等交互能力提供基础结构。
 */
export interface TreeIndex {
  nodes: TreeNodeModel[]
  keyNodeMap: Map<TreeKey, TreeNodeModel>
  parentKeyMap: Map<TreeKey, TreeKey | null>
  childrenKeyMap: Map<TreeKey, TreeKey[]>
  visibleNodeKeys: TreeKey[]
}
