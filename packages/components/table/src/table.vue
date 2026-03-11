<template>
  <component :is="h(ElTable, { ...mergedTableAttrs, ref: setTableRef }, tableSlots)" />
</template>

<script lang="ts" setup>
import Sortable from 'sortablejs'
import type { SortableEvent } from 'sortablejs'
import { ElTable } from 'element-plus'
import type { TableInstance } from 'element-plus'
import type { ComponentInstance, VNode } from 'vue'
import {
  Comment,
  Fragment,
  Text,
  cloneVNode,
  computed,
  isVNode,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  useAttrs,
  useSlots,
  h,
  watch
} from 'vue'
import { useMergedExpose } from '@falcon-ui/hooks'
import { invokeListener, useNamespace } from '@falcon-ui/utils'
import type {
  CellChangeEvent,
  ColumnDragEvent,
  ColumnOrderChangeEvent,
  RowData,
  RowDragEvent,
  RowOrderChangeEvent,
  SelectionRowToggleEvent
} from './table'
import { tableEmits, tableProps } from './table'
import { createTableProxyDataBuilder } from './proxy-data'

defineOptions({
  name: 'FlTable',
  inheritAttrs: false
})

type CellClassNameScope = {
  row: RowData
  column: ColumnState
  rowIndex: number
  columnIndex: number
}

type HeaderCellClassNameScope = {
  column: ColumnState
  rowIndex: number
  columnIndex: number
}

type ColumnState = {
  type?: string
  columnKey?: string
  rawColumnKey?: string
}

type ActiveCell = {
  rowKey: string | number
  columnKey: string
}

type ClientPoint = {
  x: number
  y: number
}

type ColumnDragIndicatorSide = 'left' | 'right'

type ColumnDropState = {
  dropDisplayIndex: number
  targetDisplayIndex: number
  side: ColumnDragIndicatorSide
}

const COLUMN_RESIZE_HOTZONE_PX = 8
const ROW_DRAG_HANDLE_HOTZONE_PX = 24
const CONTROL_COLUMN_TYPES = new Set(['selection', 'index', 'expand'])

const props = defineProps(tableProps)
const emit = defineEmits(tableEmits)
const attrs = useAttrs()
const slots = useSlots()
const ns = useNamespace('table')
const rawAttrs = attrs as Record<string, unknown>

const tableRef = shallowRef<TableInstance | null>(null)
const rowSortable = shallowRef<Sortable | null>(null)
const columnSortable = shallowRef<Sortable | null>(null)
const columnOrder = ref<number[]>([])
const columnDragCount = ref<number | null>(null)
const visibleColumnCount = ref<number>(0)
const draggingColumnOldDisplayIndex = ref<number | null>(null)
const pendingColumnDropDisplayIndex = ref<number | null>(null)
const columnDragIndicatorDisplayIndex = ref<number | null>(null)
const columnDragIndicatorSide = ref<ColumnDragIndicatorSide | null>(null)
const isColumnDragging = ref<boolean>(false)
const columnDragPointerMoveListener = ref<((event: Event) => void) | null>(null)
const isColumnResizeGesture = ref<boolean>(false)
const columnResizeGuardHeaderRow = shallowRef<HTMLElement | null>(null)
const columnResizePointerDownListener = ref<((event: Event) => void) | null>(null)
const columnResizePointerUpListener = ref<((event: Event) => void) | null>(null)
const activeCell = ref<ActiveCell | null>(null)
const outsidePointerDownListener = ref<((event: Event) => void) | null>(null)
const buildProxyData = createTableProxyDataBuilder()

const { changeRef } = useMergedExpose({})

const setTableRef = (instance: unknown) => {
  tableRef.value = instance as TableInstance | null
  changeRef(instance)
}

const flattenSlotNodes = (nodes: unknown): VNode[] => {
  const flatNodes: VNode[] = []
  const list = Array.isArray(nodes) ? nodes : []

  const visit = (node: unknown) => {
    if (!isVNode(node)) {
      return
    }

    if (node.type === Comment || node.type === Text) {
      return
    }

    if (node.type === Fragment && Array.isArray(node.children)) {
      for (const child of node.children) {
        visit(child)
      }
      return
    }

    flatNodes.push(node)
  }

  for (const node of list) {
    visit(node)
  }

  return flatNodes
}

const getInternalColumnKey = (sourceIndex: number) => `column-${sourceIndex}`

const createColumnOrder = (count: number): number[] =>
  Array.from({ length: count }, (_, index) => index)

const resolveColumnOrder = (
  count: number,
  currentOrder: number[] = columnOrder.value
): number[] => {
  if (
    count <= 0 ||
    currentOrder.length !== count ||
    new Set(currentOrder).size !== count ||
    currentOrder.some((index) => index < 0 || index >= count)
  ) {
    return createColumnOrder(count)
  }

  return currentOrder
}

const reorderColumnOrder = (order: number[], oldIndex: number, newIndex: number): number[] => {
  if (oldIndex === newIndex) {
    return [...order]
  }

  const nextOrder = [...order]
  const [moved] = nextOrder.splice(oldIndex, 1)
  if (moved === undefined) {
    return [...order]
  }

  nextOrder.splice(newIndex, 0, moved)
  return nextOrder
}

const tableSlots = computed(() => {
  const orderSnapshot = columnOrder.value
  const userDefaultSlot = slots.default

  if (!userDefaultSlot) {
    return slots
  }

  return {
    ...slots,
    default: (...args: unknown[]) => {
      const rawNodes = userDefaultSlot(...args)
      const columnNodes = flattenSlotNodes(rawNodes)
      if (columnNodes.length === 0) {
        return rawNodes
      }

      const activeOrder = resolveColumnOrder(columnNodes.length, orderSnapshot)
      return activeOrder
        .map((sourceIndex) => {
          const node = columnNodes[sourceIndex]
          if (!node) {
            return null
          }

          return cloneVNode(node, {
            key: node.key ?? `fl-table-column-${sourceIndex}`,
            columnKey: getInternalColumnKey(sourceIndex)
          })
        })
        .filter((node): node is VNode => node !== null)
    }
  }
})

const controlledAttrKeys = [
  'class',
  'data',
  'border',
  'stripe',
  'highlightCurrentRow',
  'highlight-current-row',
  'headerRowClassName',
  'header-row-class-name',
  'cellClassName',
  'cell-class-name',
  'headerCellClassName',
  'header-cell-class-name',
  'onCellClick',
  'onCell-click',
  'onRowClick',
  'onSelect',
  'onSelectAll'
]

const readAttr = <T = unknown,>(...keys: string[]): T | undefined => {
  for (const key of keys) {
    if (key in rawAttrs) {
      return rawAttrs[key] as T
    }
  }

  return undefined
}

const normalizeClass = (value: unknown): string[] => {
  if (!value) {
    return []
  }

  if (typeof value === 'string') {
    return value
      .split(' ')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeClass(item))
  }

  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .filter(([, enabled]) => Boolean(enabled))
      .map(([name]) => name)
  }

  return []
}

const mergeClass = (...values: unknown[]): string => {
  const classSet = new Set<string>()
  for (const item of values.flatMap((value) => normalizeClass(value))) {
    classSet.add(item)
  }

  return Array.from(classSet).join(' ')
}

const resolveBooleanAttr = (defaultValue: boolean, ...keys: string[]): boolean => {
  const value = readAttr(...keys)
  if (value === undefined) {
    return defaultValue
  }

  if (value === '') {
    return true
  }

  if (typeof value === 'boolean') {
    return value
  }

  return Boolean(value)
}

const toNullableIndex = (value: unknown): number | null =>
  typeof value === 'number' && Number.isInteger(value) ? value : null

const reorderRows = (rows: RowData[], oldIndex: number, newIndex: number): RowData[] => {
  if (oldIndex === newIndex) {
    return [...rows]
  }

  const next = [...rows]
  const [moved] = next.splice(oldIndex, 1)
  if (!moved) {
    return [...rows]
  }

  next.splice(newIndex, 0, moved)
  return next
}

const getTableElement = (): HTMLElement | null => {
  const candidate = (tableRef.value as unknown as { $el?: Element | null })?.$el
  return candidate instanceof HTMLElement ? candidate : null
}

const hasSelectionColumn = (): boolean => {
  const tableElement = getTableElement()
  if (!tableElement) {
    return false
  }

  return (
    tableElement.querySelector('.el-table__header-wrapper th.el-table-column--selection') !== null
  )
}

const getSelectionRows = (): RowData[] => {
  const rows = tableRef.value?.getSelectionRows?.()
  return Array.isArray(rows) ? (rows as RowData[]) : []
}

const sourceData = computed<RowData[]>(() => props.data)

const tableData = computed<RowData[]>(() => {
  if (!props.enableCellProxyIntercept) {
    return sourceData.value
  }

  return buildProxyData({
    data: sourceData.value,
    rowKeyField: props.rowKeyField,
    maxDepth: props.cellProxyMaxDepth,
    resolveRowIndex: (row) => sourceData.value.indexOf(row),
    onCellChange: (payload: CellChangeEvent) => {
      emit('cell-change', payload)
    }
  })
})

const forwardedAttrs = computed(() => {
  const next = { ...rawAttrs }
  for (const key of controlledAttrKeys) {
    delete next[key]
  }

  return next
})

const readRowKey = (row: RowData): string | number | null => {
  const candidate = row[props.rowKeyField]
  return typeof candidate === 'string' || typeof candidate === 'number' ? candidate : null
}

const isControlColumn = (column: ColumnState | null | undefined): boolean =>
  typeof column?.type === 'string' && CONTROL_COLUMN_TYPES.has(column.type)

const resolveColumnKey = (
  column: ColumnState | null | undefined,
  displayIndex: number | null = null
): string | null => {
  if (typeof column?.columnKey === 'string' && column.columnKey) {
    return column.columnKey
  }

  if (typeof column?.rawColumnKey === 'string' && column.rawColumnKey) {
    return column.rawColumnKey
  }

  if (displayIndex === null) {
    return null
  }

  const count = Math.max(columnOrder.value.length, displayIndex + 1, visibleColumnCount.value)
  const activeOrder = resolveColumnOrder(count)
  const sourceIndex = activeOrder[displayIndex] ?? displayIndex
  return getInternalColumnKey(sourceIndex)
}

const resolveCellDisplayIndex = (cell: Element | null): number | null => {
  if (
    !(cell instanceof HTMLTableCellElement) ||
    !(cell.parentElement instanceof HTMLTableRowElement)
  ) {
    return null
  }

  return Array.from(cell.parentElement.children).indexOf(cell)
}

const isRowDragHandleHotzone = (
  cell: Element | null,
  event: Event,
  displayIndex: number | null
) => {
  if (
    !props.rowDraggable ||
    displayIndex !== props.rowDragHandleColumnIndex ||
    !(cell instanceof HTMLElement)
  ) {
    return false
  }

  const point = readClientPointFromEvent(event)
  if (!point) {
    return false
  }

  const rect = cell.getBoundingClientRect()
  return point.x - rect.left <= Math.min(ROW_DRAG_HANDLE_HOTZONE_PX, rect.width)
}

const setActiveCell = (
  row: RowData,
  column: ColumnState | null | undefined,
  displayIndex: number
) => {
  if (!props.crossHighlight || isControlColumn(column)) {
    return
  }

  const rowKey = readRowKey(row)
  const columnKey = resolveColumnKey(column, displayIndex)

  if (rowKey === null || !columnKey) {
    return
  }

  activeCell.value = {
    rowKey,
    columnKey
  }
}

const resolveSelectionTogglePayload = (
  row: RowData,
  selectionBefore: RowData[],
  selectionAfter: RowData[],
  trigger: SelectionRowToggleEvent['trigger']
): SelectionRowToggleEvent => ({
  row,
  rowIndex: sourceData.value.indexOf(row),
  selected: selectionAfter.includes(row),
  selectionBefore,
  selectionAfter,
  trigger
})

const handleRowClick = (row: RowData, column: unknown, event: Event) => {
  if (props.selectionRowClick && hasSelectionColumn() && tableRef.value) {
    const selectionBefore = getSelectionRows()

    if (props.selectionSingle) {
      tableRef.value.clearSelection()
      tableRef.value.toggleRowSelection(row, true)
    } else {
      const nextSelected = !selectionBefore.includes(row)
      tableRef.value.toggleRowSelection(row, nextSelected)
    }

    const selectionAfter = getSelectionRows()
    emit(
      'selection-row-toggle',
      resolveSelectionTogglePayload(row, selectionBefore, selectionAfter, 'row-click')
    )
  }

  invokeListener(readAttr('onRowClick'), row, column, event)
}

const handleCellClick = (row: RowData, column: ColumnState, cell: Element, event: Event) => {
  const displayIndex = resolveCellDisplayIndex(cell)
  const isHandleHotzone = isRowDragHandleHotzone(cell, event, displayIndex)

  if (!isHandleHotzone && displayIndex !== null) {
    setActiveCell(row, column, displayIndex)
  }

  invokeListener(readAttr('onCellClick', 'onCell-click'), row, column, cell, event)
}

const handleSelect = (selection: RowData[], row: RowData) => {
  if (props.selectionSingle && tableRef.value && selection.length > 1) {
    tableRef.value.clearSelection()
    tableRef.value.toggleRowSelection(row, true)

    const nextSelection = getSelectionRows()

    emit('selection-single-conflict', {
      reason: 'multiple-selected',
      selection
    })

    emit(
      'selection-row-toggle',
      resolveSelectionTogglePayload(row, selection, nextSelection, 'selection-change')
    )

    invokeListener(readAttr('onSelect'), nextSelection, row)
    return
  }

  invokeListener(readAttr('onSelect'), selection, row)
}

const handleSelectAll = (selection: RowData[]) => {
  if (props.selectionSingle && tableRef.value) {
    tableRef.value.clearSelection()

    emit('selection-single-conflict', {
      reason: 'select-all-disabled',
      selection
    })

    invokeListener(readAttr('onSelectAll'), [])
    return
  }

  invokeListener(readAttr('onSelectAll'), selection)
}

const resolveHeaderRowClassName = () => {
  const baseClass = ns.e('header-row')
  const userClassName = readAttr('headerRowClassName', 'header-row-class-name')

  if (typeof userClassName === 'function') {
    return (...args: unknown[]) => mergeClass(userClassName(...args), baseClass)
  }

  return mergeClass(userClassName, baseClass)
}

const resolveCellClassName = () => {
  const userCellClassName = readAttr('cellClassName', 'cell-class-name')

  const resolveCrossClass = (scope: CellClassNameScope): string | null => {
    if (!props.crossHighlight || !activeCell.value) {
      return null
    }

    const rowKey = readRowKey(scope.row)
    if (rowKey === null) {
      return null
    }

    if (isControlColumn(scope.column)) {
      return rowKey === activeCell.value.rowKey ? ns.e('cross-control-cell') : null
    }

    const columnKey = resolveColumnKey(scope.column, scope.columnIndex)
    if (!columnKey) {
      return null
    }

    const isActiveRow = rowKey === activeCell.value.rowKey
    const isActiveColumn = columnKey === activeCell.value.columnKey

    if (isActiveRow && isActiveColumn) {
      return ns.e('cross-active')
    }

    if (isActiveRow) {
      return ns.e('cross-row')
    }

    if (isActiveColumn) {
      return ns.e('cross-column')
    }

    return null
  }

  const resolveByScope = (scope: CellClassNameScope) =>
    mergeClass(
      typeof userCellClassName === 'function' ? userCellClassName(scope) : userCellClassName,
      props.rowDraggable &&
        scope.columnIndex === props.rowDragHandleColumnIndex &&
        ns.e('row-drag-cell'),
      resolveCrossClass(scope)
    )

  return (scope: CellClassNameScope) => resolveByScope(scope)
}

const resolveHeaderCellClassName = () => {
  const userHeaderCellClassName = readAttr('headerCellClassName', 'header-cell-class-name')

  const resolveByScope = (scope: HeaderCellClassNameScope) => {
    const columnClass =
      props.crossHighlight &&
      activeCell.value &&
      !isControlColumn(scope.column) &&
      resolveColumnKey(scope.column, scope.columnIndex) === activeCell.value.columnKey
        ? ns.e('cross-column')
        : null

    return mergeClass(
      typeof userHeaderCellClassName === 'function'
        ? userHeaderCellClassName(scope)
        : userHeaderCellClassName,
      columnClass
    )
  }

  return (scope: HeaderCellClassNameScope) => resolveByScope(scope)
}

const syncVisibleColumnCount = (headerRow: HTMLElement) => {
  const cells = headerRow.querySelectorAll<HTMLElement>('th.el-table__cell')
  visibleColumnCount.value = cells.length
}

const readStoreColumns = () =>
  (
    tableRef.value as unknown as {
      store?: {
        states?: {
          columns?: {
            value?: unknown[]
          }
        }
      }
    }
  )?.store?.states?.columns?.value

const columnStoreSignature = computed(() => {
  const columns = readStoreColumns()
  if (!Array.isArray(columns)) {
    return ''
  }

  return columns
    .map((column, index) => {
      const current = column as ColumnState & { label?: unknown; property?: unknown }
      return [
        index,
        String(current.columnKey ?? ''),
        String(current.type ?? ''),
        String(current.label ?? ''),
        String(current.property ?? '')
      ].join(':')
    })
    .join('|')
})

const readStoreColumnCount = (): number => {
  const columns = readStoreColumns()

  return Array.isArray(columns) ? columns.length : 0
}

const resolveColumnCount = (headerRow: HTMLElement | null, minimumCount = 0): number => {
  const headerCount = headerRow?.querySelectorAll<HTMLElement>('th.el-table__cell').length ?? 0

  return Math.max(minimumCount, columnOrder.value.length, readStoreColumnCount(), headerCount)
}

const destroyRowSortable = () => {
  rowSortable.value?.destroy()
  rowSortable.value = null
}

const stopColumnResizeGestureReleaseTracking = () => {
  if (!columnResizePointerUpListener.value) {
    return
  }

  document.removeEventListener('pointerup', columnResizePointerUpListener.value)
  document.removeEventListener('mouseup', columnResizePointerUpListener.value)
  document.removeEventListener('touchend', columnResizePointerUpListener.value)
  document.removeEventListener('touchcancel', columnResizePointerUpListener.value)
  document.removeEventListener('dragend', columnResizePointerUpListener.value)
  columnResizePointerUpListener.value = null
}

const clearColumnResizeGesture = () => {
  stopColumnResizeGestureReleaseTracking()
  columnSortable.value?.option?.('disabled', false)
  isColumnResizeGesture.value = false
}

const unbindColumnResizeGuard = () => {
  if (columnResizeGuardHeaderRow.value && columnResizePointerDownListener.value) {
    columnResizeGuardHeaderRow.value.removeEventListener(
      'pointerdown',
      columnResizePointerDownListener.value,
      true
    )
    columnResizeGuardHeaderRow.value.removeEventListener(
      'mousedown',
      columnResizePointerDownListener.value,
      true
    )
    columnResizeGuardHeaderRow.value.removeEventListener(
      'touchstart',
      columnResizePointerDownListener.value,
      true
    )
  }

  columnResizeGuardHeaderRow.value = null
  columnResizePointerDownListener.value = null
}

const destroyColumnSortable = () => {
  clearColumnResizeGesture()
  unbindColumnResizeGuard()
  columnSortable.value?.destroy()
  columnSortable.value = null
  if (columnDragPointerMoveListener.value) {
    document.removeEventListener('dragover', columnDragPointerMoveListener.value)
    document.removeEventListener('pointermove', columnDragPointerMoveListener.value)
    document.removeEventListener('mousemove', columnDragPointerMoveListener.value)
    document.removeEventListener('touchmove', columnDragPointerMoveListener.value)
    columnDragPointerMoveListener.value = null
  }
  isColumnDragging.value = false
  columnDragCount.value = null
  draggingColumnOldDisplayIndex.value = null
  pendingColumnDropDisplayIndex.value = null
  columnDragIndicatorDisplayIndex.value = null
  columnDragIndicatorSide.value = null
  const tableElement = getTableElement()
  if (tableElement) {
    const leftClass = ns.e('column-drag-indicator-left')
    const rightClass = ns.e('column-drag-indicator-right')
    tableElement
      .querySelectorAll<HTMLElement>('th.el-table__cell, td.el-table__cell')
      .forEach((cell) => {
        cell.classList.remove(leftClass, rightClass)
      })
  }
}

const unbindOutsidePointerDown = () => {
  if (!outsidePointerDownListener.value) {
    return
  }

  document.removeEventListener('pointerdown', outsidePointerDownListener.value, true)
  document.removeEventListener('mousedown', outsidePointerDownListener.value, true)
  document.removeEventListener('touchstart', outsidePointerDownListener.value, true)
  outsidePointerDownListener.value = null
}

const bindOutsidePointerDown = () => {
  unbindOutsidePointerDown()

  const listener = (event: Event) => {
    if (!props.crossHighlight || !activeCell.value) {
      return
    }

    const tableElement = getTableElement()
    const target = event.target
    if (!tableElement || !(target instanceof Node) || tableElement.contains(target)) {
      return
    }

    activeCell.value = null
  }

  outsidePointerDownListener.value = listener
  document.addEventListener('pointerdown', listener, true)
  document.addEventListener('mousedown', listener, true)
  document.addEventListener('touchstart', listener, true)
}

const readClientPointFromEvent = (event: Event): ClientPoint | null => {
  const pointEvent = event as { clientX?: unknown; clientY?: unknown }
  if (typeof pointEvent.clientX === 'number' && typeof pointEvent.clientY === 'number') {
    return { x: pointEvent.clientX, y: pointEvent.clientY }
  }

  if (typeof MouseEvent !== 'undefined' && event instanceof MouseEvent) {
    return { x: event.clientX, y: event.clientY }
  }

  if (typeof TouchEvent !== 'undefined' && event instanceof TouchEvent) {
    const touch = event.touches[0] ?? event.changedTouches[0]
    return touch
      ? {
          x: touch.clientX,
          y: touch.clientY
        }
      : null
  }

  return null
}

const resolveHeaderCellFromEvent = (event: Event): HTMLElement | null => {
  const target = event.target
  if (!(target instanceof Element)) {
    return null
  }

  const headerCell = target.closest('th.el-table__cell')
  return headerCell instanceof HTMLElement ? headerCell : null
}

const isColumnResizeHotzone = (headerCell: HTMLElement, clientX: number): boolean => {
  const rect = headerCell.getBoundingClientRect()
  if (rect.width <= 0) {
    return false
  }

  const hotzoneWidth = Math.min(COLUMN_RESIZE_HOTZONE_PX, rect.width / 2)
  return clientX - rect.left <= hotzoneWidth || rect.right - clientX <= hotzoneWidth
}

const startColumnResizeGestureReleaseTracking = () => {
  stopColumnResizeGestureReleaseTracking()

  const listener = () => {
    clearColumnResizeGesture()
  }

  columnResizePointerUpListener.value = listener
  document.addEventListener('pointerup', listener)
  document.addEventListener('mouseup', listener)
  document.addEventListener('touchend', listener)
  document.addEventListener('touchcancel', listener)
  document.addEventListener('dragend', listener)
}

const bindColumnResizeGuard = (headerRow: HTMLElement) => {
  unbindColumnResizeGuard()

  const listener = (event: Event) => {
    const point = readClientPointFromEvent(event)
    const headerCell = resolveHeaderCellFromEvent(event)
    const hitResizeHotzone =
      point !== null && headerCell !== null && isColumnResizeHotzone(headerCell, point.x)

    if (!hitResizeHotzone) {
      if (!isColumnDragging.value && isColumnResizeGesture.value) {
        clearColumnResizeGesture()
      }
      return
    }

    isColumnResizeGesture.value = true
    updateColumnDragState(null)
    columnSortable.value?.option?.('disabled', true)
    startColumnResizeGestureReleaseTracking()
  }

  columnResizeGuardHeaderRow.value = headerRow
  columnResizePointerDownListener.value = listener
  headerRow.addEventListener('pointerdown', listener, true)
  headerRow.addEventListener('mousedown', listener, true)
  headerRow.addEventListener('touchstart', listener, true)
}

const updateColumnDragState = (state: ColumnDropState | null) => {
  const leftClass = ns.e('column-drag-indicator-left')
  const rightClass = ns.e('column-drag-indicator-right')
  const tableElement = getTableElement()
  if (tableElement) {
    tableElement
      .querySelectorAll<HTMLElement>('th.el-table__cell, td.el-table__cell')
      .forEach((cell) => {
        cell.classList.remove(leftClass, rightClass)
      })
  }
  if (!state) {
    pendingColumnDropDisplayIndex.value = null
    columnDragIndicatorDisplayIndex.value = null
    columnDragIndicatorSide.value = null
    return
  }
  pendingColumnDropDisplayIndex.value = state.dropDisplayIndex
  columnDragIndicatorDisplayIndex.value = state.targetDisplayIndex
  columnDragIndicatorSide.value = state.side
  if (!tableElement) {
    return
  }
  const indicatorClass = state.side === 'left' ? leftClass : rightClass
  const headerCells = Array.from(
    tableElement.querySelectorAll<HTMLElement>('.el-table__header-wrapper th.el-table__cell')
  )
  const headerCell = headerCells[state.targetDisplayIndex]
  headerCell?.classList.add(indicatorClass)

  const bodyRows = Array.from(
    tableElement.querySelectorAll<HTMLElement>('.el-table__body-wrapper tbody tr')
  )
  for (const row of bodyRows) {
    const bodyCells = Array.from(row.querySelectorAll<HTMLElement>('td.el-table__cell'))
    bodyCells[state.targetDisplayIndex]?.classList.add(indicatorClass)
  }
}

const resolveColumnDropStateByClientPoint = (
  point: ClientPoint,
  oldIndex: number | null
): ColumnDropState | null => {
  const tableElement = getTableElement()
  const headerRow = tableElement?.querySelector('.el-table__header-wrapper thead tr')
  if (!(headerRow instanceof HTMLElement)) {
    return null
  }

  const headerRowRect = headerRow.getBoundingClientRect()
  if (
    point.x < headerRowRect.left ||
    point.x > headerRowRect.right ||
    point.y < headerRowRect.top ||
    point.y > headerRowRect.bottom
  ) {
    return null
  }

  const cells = Array.from(headerRow.querySelectorAll<HTMLElement>('th.el-table__cell'))
  if (cells.length === 0) {
    return null
  }

  let targetDisplayIndex = cells.length - 1
  for (let index = 0; index < cells.length; index += 1) {
    const rect = cells[index].getBoundingClientRect()
    if (point.x <= rect.right) {
      targetDisplayIndex = index
      break
    }
  }

  const targetCellRect = cells[targetDisplayIndex]?.getBoundingClientRect()
  if (!targetCellRect) {
    return null
  }

  const targetCenterX = targetCellRect.left + targetCellRect.width / 2
  const side: ColumnDragIndicatorSide = point.x < targetCenterX ? 'left' : 'right'

  let dropDisplayIndex = targetDisplayIndex + (side === 'right' ? 1 : 0)
  if (oldIndex !== null && dropDisplayIndex > oldIndex) {
    dropDisplayIndex -= 1
  }
  const maxIndex = cells.length - 1
  return {
    dropDisplayIndex: Math.min(Math.max(dropDisplayIndex, 0), maxIndex),
    targetDisplayIndex,
    side
  }
}

const startColumnDragPointerTracking = (oldIndex: number | null) => {
  if (columnDragPointerMoveListener.value) {
    document.removeEventListener('dragover', columnDragPointerMoveListener.value)
    document.removeEventListener('pointermove', columnDragPointerMoveListener.value)
    document.removeEventListener('mousemove', columnDragPointerMoveListener.value)
    document.removeEventListener('touchmove', columnDragPointerMoveListener.value)
  }

  const listener = (event: Event) => {
    const point = readClientPointFromEvent(event)
    if (!point) {
      return
    }

    updateColumnDragState(resolveColumnDropStateByClientPoint(point, oldIndex))
  }

  columnDragPointerMoveListener.value = listener
  document.addEventListener('dragover', listener)
  document.addEventListener('pointermove', listener)
  document.addEventListener('mousemove', listener)
  document.addEventListener('touchmove', listener)
}

const initRowSortable = () => {
  destroyRowSortable()

  if (!props.rowDraggable) {
    return
  }

  const tableElement = getTableElement()
  const body = tableElement?.querySelector('.el-table__body-wrapper tbody')

  if (!(body instanceof HTMLElement)) {
    return
  }

  rowSortable.value = Sortable.create(body, {
    animation: 180,
    draggable: 'tr',
    handle: `.${ns.e('row-drag-cell')}`,
    onStart: (event: SortableEvent) => {
      const oldIndex = toNullableIndex(event.oldIndex)
      const payload: RowDragEvent = {
        oldIndex,
        newIndex: null,
        row: oldIndex === null ? null : (sourceData.value[oldIndex] ?? null)
      }

      emit('row-drag-start', payload)
    },
    onEnd: (event: SortableEvent) => {
      const oldIndex = toNullableIndex(event.oldIndex)
      const newIndex = toNullableIndex(event.newIndex)
      const row = oldIndex === null ? null : (sourceData.value[oldIndex] ?? null)
      const payload: RowDragEvent = {
        oldIndex,
        newIndex,
        row
      }

      emit('row-drag-end', payload)

      if (row && oldIndex !== null && newIndex !== null && oldIndex !== newIndex) {
        const orderPayload: RowOrderChangeEvent = {
          oldIndex,
          newIndex,
          row,
          data: reorderRows(sourceData.value, oldIndex, newIndex)
        }
        emit('row-order-change', orderPayload)
      }
    }
  })
}

const initColumnSortable = () => {
  destroyColumnSortable()

  if (!props.columnDraggable) {
    return
  }

  const tableElement = getTableElement()
  const headerRow = tableElement?.querySelector('.el-table__header-wrapper thead tr')

  if (!(headerRow instanceof HTMLElement)) {
    return
  }

  syncVisibleColumnCount(headerRow)

  columnSortable.value = Sortable.create(headerRow, {
    animation: 180,
    draggable: 'th.el-table__cell',
    sort: false,
    onStart: (event: SortableEvent) => {
      if (isColumnResizeGesture.value) {
        return
      }

      const oldIndex = toNullableIndex(event.oldIndex)
      isColumnDragging.value = true
      draggingColumnOldDisplayIndex.value = oldIndex
      updateColumnDragState(null)
      startColumnDragPointerTracking(oldIndex)
      const count = resolveColumnCount(headerRow, (oldIndex ?? -1) + 1)
      columnDragCount.value = count
      const activeOrder = resolveColumnOrder(count)
      const payload: ColumnDragEvent = {
        oldIndex,
        newIndex: null,
        columnIndex: oldIndex === null ? null : (activeOrder[oldIndex] ?? oldIndex)
      }

      emit('column-drag-start', payload)
    },
    onEnd: (event: SortableEvent) => {
      if (isColumnResizeGesture.value) {
        clearColumnResizeGesture()
        return
      }

      if (columnDragPointerMoveListener.value) {
        document.removeEventListener('dragover', columnDragPointerMoveListener.value)
        document.removeEventListener('pointermove', columnDragPointerMoveListener.value)
        document.removeEventListener('mousemove', columnDragPointerMoveListener.value)
        document.removeEventListener('touchmove', columnDragPointerMoveListener.value)
        columnDragPointerMoveListener.value = null
      }
      const oldIndex = toNullableIndex(event.oldIndex) ?? draggingColumnOldDisplayIndex.value
      const fallbackNewIndex = toNullableIndex(event.newIndex)
      const originalEvent = (event as { originalEvent?: Event }).originalEvent
      const point = originalEvent ? readClientPointFromEvent(originalEvent) : null
      const pointerState =
        point === null
          ? null
          : resolveColumnDropStateByClientPoint(point, draggingColumnOldDisplayIndex.value)
      const newIndex =
        pointerState?.dropDisplayIndex ?? pendingColumnDropDisplayIndex.value ?? fallbackNewIndex
      const maxDragIndex = Math.max(oldIndex ?? -1, newIndex ?? -1)
      const latestHeaderRow = getTableElement()?.querySelector('.el-table__header-wrapper thead tr')
      const count = Math.max(
        columnDragCount.value ?? 0,
        resolveColumnCount(
          latestHeaderRow instanceof HTMLElement ? latestHeaderRow : headerRow,
          maxDragIndex + 1
        )
      )
      const activeOrder = resolveColumnOrder(count)
      const columnIndex = oldIndex === null ? null : (activeOrder[oldIndex] ?? oldIndex)
      const payload: ColumnDragEvent = {
        oldIndex,
        newIndex,
        columnIndex
      }

      emit('column-drag-end', payload)

      if (oldIndex !== null && newIndex !== null && oldIndex !== newIndex) {
        const nextOrder = reorderColumnOrder(activeOrder, oldIndex, newIndex)
        const movedColumnSourceIndex = activeOrder[oldIndex] ?? oldIndex
        columnOrder.value = nextOrder

        const orderPayload: ColumnOrderChangeEvent = {
          oldIndex,
          newIndex,
          columnIndex: movedColumnSourceIndex,
          order: nextOrder
        }

        emit('column-order-change', orderPayload)

        void nextTick(() => {
          const tableElement = getTableElement()
          const latestHeaderRow = tableElement?.querySelector('.el-table__header-wrapper thead tr')
          if (latestHeaderRow instanceof HTMLElement) {
            syncVisibleColumnCount(latestHeaderRow)
          }
        })
      }

      isColumnDragging.value = false
      columnDragCount.value = null
      draggingColumnOldDisplayIndex.value = null
      updateColumnDragState(null)
    }
  })

  bindColumnResizeGuard(headerRow)
}

const refreshSortables = async () => {
  await nextTick()
  initRowSortable()
  initColumnSortable()
}

const mergedTableAttrs = computed(() => ({
  ...forwardedAttrs.value,
  class: [ns.b(), readAttr('class')],
  data: tableData.value,
  border: resolveBooleanAttr(true, 'border'),
  stripe: resolveBooleanAttr(true, 'stripe'),
  highlightCurrentRow: resolveBooleanAttr(true, 'highlightCurrentRow', 'highlight-current-row'),
  headerRowClassName: resolveHeaderRowClassName(),
  cellClassName: resolveCellClassName(),
  headerCellClassName: resolveHeaderCellClassName(),
  onCellClick: handleCellClick,
  onRowClick: handleRowClick,
  onSelect: handleSelect,
  onSelectAll: handleSelectAll
}))

watch(
  () => props.crossHighlight,
  (enabled) => {
    if (!enabled) {
      activeCell.value = null
    }
  }
)

watch(columnStoreSignature, (next, prev) => {
  if (prev !== undefined && next !== prev) {
    activeCell.value = null
  }
})

watch(
  () => [sourceData.value.length, props.rowKeyField],
  () => {
    if (!activeCell.value) {
      return
    }

    const hasActiveRow = sourceData.value.some(
      (row) => readRowKey(row) === activeCell.value?.rowKey
    )
    if (!hasActiveRow) {
      activeCell.value = null
    }
  }
)

onMounted(() => {
  bindOutsidePointerDown()
  void refreshSortables()
})

watch(
  () => [
    props.rowDraggable,
    props.columnDraggable,
    props.rowDragHandleColumnIndex,
    sourceData.value.length
  ],
  () => {
    void refreshSortables()
  },
  { flush: 'post' }
)

onBeforeUnmount(() => {
  unbindOutsidePointerDown()
  destroyRowSortable()
  destroyColumnSortable()
})

defineExpose({} as ComponentInstance<typeof ElTable>)
</script>
