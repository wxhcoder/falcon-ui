import type { ExtractPublicPropTypes, PropType } from 'vue'

export type RowData = Record<string, unknown>

export type EmitTrigger = 'row-click' | 'selection-change' | 'proxy-set'

export interface SelectionRowToggleEvent {
  row: RowData
  rowIndex: number
  selected: boolean
  selectionBefore: RowData[]
  selectionAfter: RowData[]
  trigger: Exclude<EmitTrigger, 'proxy-set'>
}

export interface SelectionSingleConflictEvent {
  reason: 'multiple-selected' | 'select-all-disabled'
  selection: RowData[]
}

export interface CellChangeEvent {
  rowIndex: number
  rowKey: string | number
  columnKey: string
  path: string
  prevValue: unknown
  nextValue: unknown
  trigger: 'proxy-set'
}

export interface RowDragEvent {
  oldIndex: number | null
  newIndex: number | null
  row: RowData | null
}

export interface RowOrderChangeEvent {
  oldIndex: number
  newIndex: number
  row: RowData
  data: RowData[]
}

export interface ColumnDragEvent {
  oldIndex: number | null
  newIndex: number | null
  columnIndex: number | null
}

export interface ColumnOrderChangeEvent {
  oldIndex: number
  newIndex: number
  columnIndex: number
  order: number[]
}

export const tableProps = {
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
   * Enable cross highlight for clicked data cells.
   */
  crossHighlight: {
    type: Boolean,
    default: false
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
    type: Array as PropType<RowData[]>,
    default: () => []
  }
} as const

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object'

const isNumber = (value: unknown): value is number => typeof value === 'number'

export const tableEmits = {
  /**
   * Emit when row click triggers selection toggle.
   */
  'selection-row-toggle': (payload: SelectionRowToggleEvent) =>
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
  'selection-single-conflict': (payload: SelectionSingleConflictEvent) =>
    isRecord(payload) &&
    (payload.reason === 'multiple-selected' || payload.reason === 'select-all-disabled') &&
    Array.isArray(payload.selection),
  /**
   * Emit when proxy-tracked row field value is changed.
   */
  'cell-change': (payload: CellChangeEvent) =>
    isRecord(payload) &&
    isNumber(payload.rowIndex) &&
    (typeof payload.rowKey === 'string' || typeof payload.rowKey === 'number') &&
    typeof payload.columnKey === 'string' &&
    typeof payload.path === 'string' &&
    payload.trigger === 'proxy-set',
  /**
   * Emit when row drag starts.
   */
  'row-drag-start': (payload: RowDragEvent) =>
    isRecord(payload) &&
    (payload.oldIndex === null || isNumber(payload.oldIndex)) &&
    (payload.newIndex === null || isNumber(payload.newIndex)),
  /**
   * Emit when row drag ends.
   */
  'row-drag-end': (payload: RowDragEvent) =>
    isRecord(payload) &&
    (payload.oldIndex === null || isNumber(payload.oldIndex)) &&
    (payload.newIndex === null || isNumber(payload.newIndex)),
  /**
   * Emit when row order has changed.
   */
  'row-order-change': (payload: RowOrderChangeEvent) =>
    isRecord(payload) &&
    isNumber(payload.oldIndex) &&
    isNumber(payload.newIndex) &&
    isRecord(payload.row) &&
    Array.isArray(payload.data),
  /**
   * Emit when column drag starts.
   */
  'column-drag-start': (payload: ColumnDragEvent) =>
    isRecord(payload) &&
    (payload.oldIndex === null || isNumber(payload.oldIndex)) &&
    (payload.newIndex === null || isNumber(payload.newIndex)) &&
    (payload.columnIndex === null || isNumber(payload.columnIndex)),
  /**
   * Emit when column drag ends.
   */
  'column-drag-end': (payload: ColumnDragEvent) =>
    isRecord(payload) &&
    (payload.oldIndex === null || isNumber(payload.oldIndex)) &&
    (payload.newIndex === null || isNumber(payload.newIndex)) &&
    (payload.columnIndex === null || isNumber(payload.columnIndex)),
  /**
   * Emit when column order has changed.
   */
  'column-order-change': (payload: ColumnOrderChangeEvent) =>
    isRecord(payload) &&
    isNumber(payload.oldIndex) &&
    isNumber(payload.newIndex) &&
    isNumber(payload.columnIndex) &&
    Array.isArray(payload.order)
} as const

export type TableProps = ExtractPublicPropTypes<typeof tableProps>
export type TableEmits = typeof tableEmits
