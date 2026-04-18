import type { CSSProperties } from 'vue'

/**
 * 树节点主键仅允许字符串或数字，避免首版引入额外的键值归一成本。
 */
export type FlTreeKey = string | number

/**
 * 原始树节点允许保留业务字段，但 `key` 始终是必填字段。
 */
export interface FlTreeRawNode {
  key: FlTreeKey
  children?: FlTreeRawNode[]
  class?: FlTreeClassValue
  [key: string]: unknown
}

/**
 * 首版字段映射保持 Element Plus Tree 的最小集合。
 */
export interface FlTreeNodePropsConfig {
  label?: string
  children?: string
  disabled?: string
  isLeaf?: string
  class?: string
}

/**
 * 语义化 DOM 名称在后续阶段继续作为稳定挂点使用。
 */
export type FlTreeSemanticDOM = 'root' | 'item' | 'itemIcon' | 'itemTitle'

/**
 * 语义化记录同时服务于 `classNames` 与 `styles`。
 */
export type FlTreeSemanticRecord<T> = Partial<Record<FlTreeSemanticDOM, T>>

/**
 * 支持字符串、数组和对象三种 Vue class 绑定形式。
 */
export type FlTreeClassValue = string | string[] | Record<string, boolean> | undefined

/**
 * `classNames` 支持对象形式和工厂函数形式。
 */
export type FlTreeClassNames =
  | FlTreeSemanticRecord<FlTreeClassValue>
  | ((info: { componentProps: unknown }) => FlTreeSemanticRecord<FlTreeClassValue>)

/**
 * `styles` 与 `classNames` 形式一致，但值类型为内联样式对象。
 */
export type FlTreeStyles =
  | FlTreeSemanticRecord<CSSProperties>
  | ((info: { componentProps: unknown }) => FlTreeSemanticRecord<CSSProperties>)

/**
 * 标准化节点是内部递归渲染骨架使用的统一结构。
 */
export interface FlTreeNormalizedNode {
  key: FlTreeKey
  level: number
  rawNode: FlTreeRawNode
  label: string
  disabled: boolean
  isLeaf: boolean
  className: FlTreeClassValue
  children: FlTreeNormalizedNode[]
}

/**
 * 树索引为后续展开、选择、勾选等交互能力提供基础结构。
 */
export interface FlTreeIndex {
  nodes: FlTreeNormalizedNode[]
  keyNodeMap: Map<FlTreeKey, FlTreeNormalizedNode>
  parentKeyMap: Map<FlTreeKey, FlTreeKey | null>
  childrenKeyMap: Map<FlTreeKey, FlTreeKey[]>
  visibleNodeKeys: FlTreeKey[]
}
