import type { ExtractPublicPropTypes, PropType } from 'vue'

export type FlTableRowData = Record<string, unknown>

export type FlTableEmitTrigger = 'row-click' | 'selection-change' | 'proxy-set'

export interface FlTableSelectionRowTogglePayload {
  row: FlTableRowData
  rowIndex: number
  selected: boolean
  selectionBefore: FlTableRowData[]
  selectionAfter: FlTableRowData[]
  trigger: Exclude<FlTableEmitTrigger, 'proxy-set'>
}

export interface FlTableSelectionSingleConflictPayload {
  reason: 'multiple-selected' | 'select-all-disabled'
  selection: FlTableRowData[]
}

export interface FlTableCellChangePayload {
  rowIndex: number
  rowKey: string | number
  columnKey: string
  path: string
  prevValue: unknown
  nextValue: unknown
  trigger: 'proxy-set'
}

export interface FlTableRowDragPayload {
  oldIndex: number | null
  newIndex: number | null
  row: FlTableRowData | null
}

export interface FlTableRowOrderChangePayload {
  oldIndex: number
  newIndex: number
  row: FlTableRowData
  data: FlTableRowData[]
}

export interface FlTableColumnDragPayload {
  oldIndex: number | null
  newIndex: number | null
  columnIndex: number | null
}

export interface FlTableColumnOrderChangePayload {
  oldIndex: number
  newIndex: number
  columnIndex: number
  order: number[]
}

export const flTableProps = {
  /**
   * Enable row click to toggle selection when selection column exists.
   */
  selectionRowClick: {
    type: Boolean,
    default: true
  },
  /**
   * Restrict selection to one row in selection-table mode.
   */
  selectionSingle: {
    type: Boolean,
    default: false
  },
  /**
   * Enable proxy intercept for row field assignments.
   */
  enableCellProxyIntercept: {
    type: Boolean,
    default: true
  },
  /**
   * Maximum proxy depth for nested row fields.
   */
  cellProxyMaxDepth: {
    type: Number,
    default: 4,
    validator: (value: number) => Number.isInteger(value) && value >= 1
  },
  /**
   * Enable row drag sorting.
   */
  rowDraggable: {
    type: Boolean,
    default: true
  },
  /**
   * Enable column drag sorting.
   */
  columnDraggable: {
    type: Boolean,
    default: true
  },
  /**
   * Which column index should act as row drag handle.
   */
  rowDragHandleColumnIndex: {
    type: Number,
    default: 0,
    validator: (value: number) => Number.isInteger(value) && value >= 0
  },
  /**
   * Field name used as row key in emitted payload.
   */
  rowKeyField: {
    type: String,
    default: 'id'
  },
  /**
   * Bound data source. Falls through to ElTable `data`.
   */
  data: {
    type: Array as PropType<FlTableRowData[]>,
    default: () => []
  }
} as const

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object'

const isNumber = (value: unknown): value is number => typeof value === 'number'

export const flTableEmits = {
  /**
   * Emit when row click triggers selection toggle.
   */
  'selection-row-toggle': (payload: FlTableSelectionRowTogglePayload) =>
    isRecord(payload) &&
    isRecord(payload.row) &&
    isNumber(payload.rowIndex) &&
    typeof payload.selected === 'boolean' &&
    Array.isArray(payload.selectionBefore) &&
    Array.isArray(payload.selectionAfter) &&
    (payload.trigger === 'row-click' || payload.trigger === 'selection-change'),
  /**
   * Emit when single-selection rule conflicts with native selection behavior.
   */
  'selection-single-conflict': (payload: FlTableSelectionSingleConflictPayload) =>
    isRecord(payload) &&
    (payload.reason === 'multiple-selected' || payload.reason === 'select-all-disabled') &&
    Array.isArray(payload.selection),
  /**
   * Emit when proxy-tracked row field value is changed.
   */
  'cell-change': (payload: FlTableCellChangePayload) =>
    isRecord(payload) &&
    isNumber(payload.rowIndex) &&
    (typeof payload.rowKey === 'string' || typeof payload.rowKey === 'number') &&
    typeof payload.columnKey === 'string' &&
    typeof payload.path === 'string' &&
    payload.trigger === 'proxy-set',
  /**
   * Emit when row drag starts.
   */
  'row-drag-start': (payload: FlTableRowDragPayload) =>
    isRecord(payload) &&
    (payload.oldIndex === null || isNumber(payload.oldIndex)) &&
    (payload.newIndex === null || isNumber(payload.newIndex)),
  /**
   * Emit when row drag ends.
   */
  'row-drag-end': (payload: FlTableRowDragPayload) =>
    isRecord(payload) &&
    (payload.oldIndex === null || isNumber(payload.oldIndex)) &&
    (payload.newIndex === null || isNumber(payload.newIndex)),
  /**
   * Emit when row order has changed.
   */
  'row-order-change': (payload: FlTableRowOrderChangePayload) =>
    isRecord(payload) &&
    isNumber(payload.oldIndex) &&
    isNumber(payload.newIndex) &&
    isRecord(payload.row) &&
    Array.isArray(payload.data),
  /**
   * Emit when column drag starts.
   */
  'column-drag-start': (payload: FlTableColumnDragPayload) =>
    isRecord(payload) &&
    (payload.oldIndex === null || isNumber(payload.oldIndex)) &&
    (payload.newIndex === null || isNumber(payload.newIndex)) &&
    (payload.columnIndex === null || isNumber(payload.columnIndex)),
  /**
   * Emit when column drag ends.
   */
  'column-drag-end': (payload: FlTableColumnDragPayload) =>
    isRecord(payload) &&
    (payload.oldIndex === null || isNumber(payload.oldIndex)) &&
    (payload.newIndex === null || isNumber(payload.newIndex)) &&
    (payload.columnIndex === null || isNumber(payload.columnIndex)),
  /**
   * Emit when column order has changed.
   */
  'column-order-change': (payload: FlTableColumnOrderChangePayload) =>
    isRecord(payload) &&
    isNumber(payload.oldIndex) &&
    isNumber(payload.newIndex) &&
    isNumber(payload.columnIndex) &&
    Array.isArray(payload.order)
} as const

export type FlTableProps = ExtractPublicPropTypes<typeof flTableProps>
export type FlTableEmits = typeof flTableEmits

export type TableProps = FlTableProps
export type TableEmits = FlTableEmits
