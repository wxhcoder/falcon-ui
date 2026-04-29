import type { CSSProperties } from 'vue'

/**
 * 树节点主键仅允许字符串或数字，避免首版引入额外的键值归一成本。
 */
export type TreeKey = string | number

/**
 * 原始树节点允许保留业务字段，但 `key` 始终是必填字段。
 */
export interface TreeData {
  key: TreeKey
  children?: TreeData[]
  class?: TreeClassValue
  disabled?: boolean
  selectable?: boolean
  disableCheckbox?: boolean
  checkable?: boolean
  isLeaf?: boolean
  [key: string]: unknown
}

/**
 * 首版字段映射保持 Element Plus Tree 的最小集合。
 */
export interface TreeNodeProps {
  label?: string
  children?: string
  disabled?: string
  isLeaf?: string
  class?: string
}

/**
 * 语义化 DOM 名称在后续阶段继续作为稳定挂点使用。
 */
export type TreeSemanticDOM = 'root' | 'item' | 'itemIcon' | 'itemCheckbox' | 'itemTitle'

/**
 * 语义化记录同时服务于 `classNames` 与 `styles`。
 */
export type TreeSemanticRecord<T> = Partial<Record<TreeSemanticDOM, T>>

/**
 * 支持字符串、数组和对象三种 Vue class 绑定形式。
 */
export type TreeClassValue = string | string[] | Record<string, boolean> | undefined

/**
 * `classNames` 支持对象形式和工厂函数形式。
 */
export type TreeClassNames =
  | TreeSemanticRecord<TreeClassValue>
  | ((info: { componentProps: unknown }) => TreeSemanticRecord<TreeClassValue>)

/**
 * `styles` 与 `classNames` 形式一致，但值类型为内联样式对象。
 */
export type TreeStyles =
  | TreeSemanticRecord<CSSProperties>
  | ((info: { componentProps: unknown }) => TreeSemanticRecord<CSSProperties>)

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
  disableCheckbox: boolean
  checkable: boolean
  isLeaf: boolean
  className: TreeClassValue
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
  disableCheckbox: boolean
  checkable: boolean
  isLeaf: boolean
  parent: TreeNode | null
  childNodes: TreeNode[]
  expanded?: boolean
}

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
