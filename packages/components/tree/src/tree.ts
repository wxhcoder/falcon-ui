import type { ExtractPublicPropTypes, PropType } from 'vue'
import type {
  FlTreeClassNames,
  FlTreeClassValue,
  FlTreeIndex,
  FlTreeKey,
  FlTreeNodePropsConfig,
  FlTreeNormalizedNode,
  FlTreeRawNode,
  FlTreeSemanticDOM,
  FlTreeSemanticRecord,
  FlTreeStyles
} from './tree-types'

/**
 * 首版使用稳定的默认字段映射，保证常规树数据可直接渲染。
 */
export const flTreeNodePropsDefaults: Required<FlTreeNodePropsConfig> = {
  label: 'label',
  children: 'children',
  disabled: 'disabled',
  isLeaf: 'isLeaf',
  class: 'class'
}

/**
 * 阶段 2 公开属性仍然只覆盖基础数据、字段映射和语义化样式挂点。
 */
export const flTreeProps = {
  data: {
    type: Array as PropType<FlTreeRawNode[]>,
    default: () => []
  },
  props: {
    type: Object as PropType<FlTreeNodePropsConfig>,
    default: () => ({ ...flTreeNodePropsDefaults })
  },
  classNames: {
    type: [Object, Function] as PropType<FlTreeClassNames>
  },
  styles: {
    type: [Object, Function] as PropType<FlTreeStyles>
  }
} as const

export type FlTreeProps = ExtractPublicPropTypes<typeof flTreeProps>

/**
 * 将用户传入的部分映射与默认映射合并，统一生成内部字段配置。
 */
export const resolveTreeNodePropsConfig = (
  propsConfig?: FlTreeNodePropsConfig
): Required<FlTreeNodePropsConfig> => ({
  ...flTreeNodePropsDefaults,
  ...propsConfig
})

/**
 * 按映射字段名读取原始节点字段，避免字段读取逻辑散落在各处。
 */
const readTreeField = (node: FlTreeRawNode, fieldName: string): unknown => node[fieldName]

/**
 * 将任意合法 class 值归一化为 Vue 可直接绑定的形式。
 */
const resolveNodeClassName = (value: unknown): FlTreeClassValue => {
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
    return value as FlTreeClassValue
  }

  return String(value)
}

/**
 * 将单个原始节点转换为内部标准化节点。
 */
export const normalizeTreeNode = (
  rawNode: FlTreeRawNode,
  level: number,
  propsConfig?: FlTreeNodePropsConfig
): FlTreeNormalizedNode => {
  const mappedProps = resolveTreeNodePropsConfig(propsConfig)
  const childrenValue = readTreeField(rawNode, mappedProps.children)
  const childNodes = Array.isArray(childrenValue) ? (childrenValue as FlTreeRawNode[]) : []

  const labelValue = readTreeField(rawNode, mappedProps.label)
  const disabledValue = readTreeField(rawNode, mappedProps.disabled)
  const isLeafValue = readTreeField(rawNode, mappedProps.isLeaf)
  const classValue = readTreeField(rawNode, mappedProps.class)

  if (rawNode.key === undefined || rawNode.key === null) {
    throw new Error('[FlTree] Every node must provide a unique `key`.')
  }

  return {
    key: rawNode.key,
    level,
    rawNode,
    label: labelValue == null ? '' : String(labelValue),
    disabled: Boolean(disabledValue),
    isLeaf: Boolean(isLeafValue),
    className: resolveNodeClassName(classValue),
    children: childNodes.map((childNode) => normalizeTreeNode(childNode, level + 1, mappedProps))
  }
}

/**
 * 在递归树结构之外，同时建立扁平索引，供后续阶段复用。
 */
export const buildTreeIndex = (
  data: FlTreeRawNode[],
  propsConfig?: FlTreeNodePropsConfig
): FlTreeIndex => {
  const keyNodeMap = new Map<FlTreeKey, FlTreeNormalizedNode>()
  const parentKeyMap = new Map<FlTreeKey, FlTreeKey | null>()
  const childrenKeyMap = new Map<FlTreeKey, FlTreeKey[]>()
  const visibleNodeKeys: FlTreeKey[] = []
  const normalizedNodes = data.map((node) => normalizeTreeNode(node, 1, propsConfig))

  /**
   * 递归遍历标准化节点，并同步填充索引表。
   */
  const visit = (nodes: FlTreeNormalizedNode[], parentKey: FlTreeKey | null) => {
    for (const node of nodes) {
      if (keyNodeMap.has(node.key)) {
        throw new Error(`[FlTree] Duplicate node key detected: ${String(node.key)}`)
      }

      keyNodeMap.set(node.key, node)
      parentKeyMap.set(node.key, parentKey)
      visibleNodeKeys.push(node.key)
      childrenKeyMap.set(
        node.key,
        node.children.map((childNode) => childNode.key)
      )

      if (node.children.length > 0) {
        visit(node.children, node.key)
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
 * 收集当前树中所有可展开节点的 key，供阶段 2 初始化默认展开状态使用。
 */
export const collectInitiallyExpandedKeys = (nodes: FlTreeNormalizedNode[]): Set<FlTreeKey> => {
  const expandedKeys = new Set<FlTreeKey>()

  /**
   * 递归遍历存在子节点的分支节点，并记录其 key。
   */
  const visit = (currentNodes: FlTreeNormalizedNode[]) => {
    for (const node of currentNodes) {
      if (node.children.length === 0) {
        continue
      }

      expandedKeys.add(node.key)
      visit(node.children)
    }
  }

  visit(nodes)

  return expandedKeys
}

/**
 * 统一解析对象形式和工厂函数形式的语义化记录。
 */
export const resolveTreeSemanticRecord = <T>(
  source:
    | FlTreeSemanticRecord<T>
    | ((info: { componentProps: unknown }) => FlTreeSemanticRecord<T>)
    | undefined,
  info: { componentProps: unknown }
): FlTreeSemanticRecord<T> => {
  if (typeof source === 'function') {
    return source(info) ?? {}
  }

  return source ?? {}
}

export type {
  FlTreeClassNames,
  FlTreeClassValue,
  FlTreeIndex,
  FlTreeKey,
  FlTreeNodePropsConfig,
  FlTreeNormalizedNode,
  FlTreeRawNode,
  FlTreeSemanticDOM,
  FlTreeSemanticRecord,
  FlTreeStyles
}
