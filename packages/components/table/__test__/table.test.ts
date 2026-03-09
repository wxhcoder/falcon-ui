import { mount } from '@vue/test-utils'
import { ElTable, ElTableColumn } from 'element-plus'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'
import type {
  FlTableCellChangePayload,
  FlTableColumnOrderChangePayload,
  FlTableProps,
  FlTableRowOrderChangePayload,
  FlTableSelectionRowTogglePayload
} from '..'
import FlTable from '../src/table.vue'

const { sortableCreate } = vi.hoisted(() => {
  const create = vi.fn((_: HTMLElement, __: Record<string, unknown>) => ({
    destroy: vi.fn()
  }))

  return {
    sortableCreate: create
  }
})

vi.mock('sortablejs', () => ({
  default: {
    create: sortableCreate
  }
}))

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

type RowData = {
  id: number
  name: string
  age: number
  profile: {
    nickname: string
  }
}

const createColumns = () => [
  h(ElTableColumn, { type: 'selection', width: 48 }),
  h(ElTableColumn, { prop: 'name', label: 'Name' }),
  h(ElTableColumn, { prop: 'age', label: 'Age' })
]

const createPlainColumns = () => [
  h(ElTableColumn, { prop: 'name', label: 'Name' }),
  h(ElTableColumn, { prop: 'age', label: 'Age' }),
  h(ElTableColumn, { prop: 'id', label: 'ID' })
]

const createRows = (): RowData[] => [
  { id: 1, name: 'A', age: 18, profile: { nickname: 'A-1' } },
  { id: 2, name: 'B', age: 20, profile: { nickname: 'B-1' } },
  { id: 3, name: 'C', age: 21, profile: { nickname: 'C-1' } }
]

const setElementRect = (
  element: Element,
  rect: { left: number; top: number; width: number; height: number }
) => {
  const nextRect = {
    x: rect.left,
    y: rect.top,
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
    toJSON: () => ({})
  }

  Object.defineProperty(element, 'getBoundingClientRect', {
    configurable: true,
    value: () => nextRect
  })
}

beforeEach(() => {
  sortableCreate.mockClear()
  vi.stubGlobal('ResizeObserver', ResizeObserverMock)
})

describe('FlTable', () => {
  it('injects default table attrs and merges header row class', async () => {
    const wrapper = mount(FlTable, {
      props: {
        data: createRows()
      },
      slots: {
        default: () => createColumns()
      }
    })

    await nextTick()

    const table = wrapper.getComponent(ElTable)
    expect(table.props('border')).toBe(true)
    expect(table.props('stripe')).toBe(true)
    expect(table.props('highlightCurrentRow')).toBe(true)

    const headerRowClassName = table.props('headerRowClassName') as
      | string
      | ((scope: unknown) => string)

    if (typeof headerRowClassName === 'function') {
      expect(headerRowClassName({})).toContain('fl-table__header-row')
    } else {
      expect(headerRowClassName).toContain('fl-table__header-row')
    }
  })

  it('keeps user overrides for default attrs', async () => {
    const wrapper = mount(FlTable, {
      props: {
        data: createRows()
      },
      attrs: {
        border: false,
        stripe: false,
        highlightCurrentRow: false,
        headerRowClassName: 'biz-header'
      },
      slots: {
        default: () => createColumns()
      }
    })

    await nextTick()

    const table = wrapper.getComponent(ElTable)
    expect(table.props('border')).toBe(false)
    expect(table.props('stripe')).toBe(false)
    expect(table.props('highlightCurrentRow')).toBe(false)

    const headerRowClassName = table.props('headerRowClassName') as
      | string
      | ((scope: unknown) => string)

    if (typeof headerRowClassName === 'function') {
      const className = headerRowClassName({})
      expect(className).toContain('biz-header')
      expect(className).toContain('fl-table__header-row')
    } else {
      expect(headerRowClassName).toContain('biz-header')
      expect(headerRowClassName).toContain('fl-table__header-row')
    }
  })

  it('toggles selection on row click when selection column exists', async () => {
    const rows = createRows()
    const wrapper = mount(FlTable, {
      props: {
        data: rows
      },
      slots: {
        default: () => createColumns()
      }
    })

    await nextTick()

    const table = wrapper.getComponent(ElTable)
    const tableVm = table.vm as unknown as {
      getSelectionRows: () => RowData[]
      toggleRowSelection: (row: RowData, selected?: boolean) => void
      clearSelection: () => void
    }

    const selection: RowData[] = []
    tableVm.getSelectionRows = vi.fn(() => [...selection])
    tableVm.toggleRowSelection = vi.fn((row: RowData, selected = false) => {
      const index = selection.indexOf(row)
      if (selected) {
        if (index < 0) {
          selection.push(row)
        }
      } else if (index >= 0) {
        selection.splice(index, 1)
      }
    })
    tableVm.clearSelection = vi.fn(() => {
      selection.splice(0)
    })

    const headerWrapper = document.createElement('div')
    headerWrapper.className = 'el-table__header-wrapper'
    headerWrapper.innerHTML =
      '<table><thead><tr><th class="el-table-column--selection"></th></tr></thead></table>'
    table.element.appendChild(headerWrapper)

    table.vm.$emit('row-click', rows[0], null, new MouseEvent('click'))
    await nextTick()

    expect(tableVm.toggleRowSelection).toHaveBeenCalledWith(rows[0], true)
    const payload = wrapper.emitted('selection-row-toggle')?.[0]?.[0] as
      | FlTableSelectionRowTogglePayload
      | undefined

    expect(payload?.row).toBe(rows[0])
    expect(payload?.selected).toBe(true)
    expect(payload?.trigger).toBe('row-click')
  })

  it('enforces single-selection for select/select-all interactions', async () => {
    const rows = createRows()
    const wrapper = mount(FlTable, {
      props: {
        data: rows,
        selectionSingle: true
      },
      slots: {
        default: () => createColumns()
      }
    })

    await nextTick()

    const table = wrapper.getComponent(ElTable)
    const tableVm = table.vm as unknown as {
      getSelectionRows: () => RowData[]
      toggleRowSelection: (row: RowData, selected?: boolean) => void
      clearSelection: () => void
    }

    tableVm.getSelectionRows = vi.fn(() => [rows[1]])
    tableVm.toggleRowSelection = vi.fn()
    tableVm.clearSelection = vi.fn()

    table.vm.$emit('select', [rows[0], rows[1]], rows[1])
    await nextTick()

    expect(tableVm.clearSelection).toHaveBeenCalledTimes(1)
    expect(tableVm.toggleRowSelection).toHaveBeenCalledWith(rows[1], true)

    const selectConflict = wrapper.emitted('selection-single-conflict')?.[0]?.[0] as
      | { reason: string }
      | undefined
    expect(selectConflict?.reason).toBe('multiple-selected')

    table.vm.$emit('select-all', rows)
    await nextTick()

    expect(tableVm.clearSelection).toHaveBeenCalledTimes(2)
    const allConflict = wrapper.emitted('selection-single-conflict')?.[1]?.[0] as
      | { reason: string }
      | undefined
    expect(allConflict?.reason).toBe('select-all-disabled')
  })

  it('emits cell-change when proxied row field is updated', async () => {
    const rows = createRows()
    const wrapper = mount(FlTable, {
      props: {
        data: rows,
        enableCellProxyIntercept: true,
        rowKeyField: 'id'
      },
      slots: {
        default: () => createColumns()
      }
    })

    await nextTick()

    const table = wrapper.getComponent(ElTable)
    const proxiedRows = table.props('data') as RowData[]

    proxiedRows[0].profile.nickname = 'A-2'
    await nextTick()

    const payload = wrapper.emitted('cell-change')?.[0]?.[0] as FlTableCellChangePayload | undefined

    expect(payload?.rowIndex).toBe(0)
    expect(payload?.rowKey).toBe(1)
    expect(payload?.columnKey).toBe('profile')
    expect(payload?.path).toBe('profile.nickname')
    expect(payload?.prevValue).toBe('A-1')
    expect(payload?.nextValue).toBe('A-2')
  })

  it('uses sortablejs for row/column drag and emits reorder payloads', async () => {
    const rows = createRows()
    const wrapper = mount(FlTable, {
      props: {
        data: rows
      },
      slots: {
        default: () => createColumns()
      }
    })

    await nextTick()
    await nextTick()

    const rowCall = sortableCreate.mock.calls.find(
      (call) => (call[1] as Record<string, unknown>).handle === '.fl-table__row-drag-cell'
    )

    expect(rowCall).toBeDefined()

    const rowOptions = rowCall?.[1] as Record<string, (event: Record<string, unknown>) => void>

    rowOptions.onStart?.({ oldIndex: 0 })
    rowOptions.onEnd?.({ oldIndex: 0, newIndex: 1 })

    const rowOrderPayload = wrapper.emitted('row-order-change')?.[0]?.[0] as
      | FlTableRowOrderChangePayload
      | undefined

    expect(rowOrderPayload?.oldIndex).toBe(0)
    expect(rowOrderPayload?.newIndex).toBe(1)
    expect(rowOrderPayload?.data.map((item) => item.id)).toEqual([2, 1, 3])

    const columnCall = sortableCreate.mock.calls.find(
      (call) => (call[1] as Record<string, unknown>).draggable === 'th.el-table__cell'
    )

    expect(columnCall).toBeDefined()
    expect((columnCall?.[1] as Record<string, unknown>)?.sort).toBe(false)

    const columnOptions = columnCall?.[1] as Record<string, (...args: unknown[]) => unknown>

    const draggingCell = document.createElement('th')
    columnOptions.onStart?.({ oldIndex: 1 })

    columnOptions.onEnd?.({
      oldIndex: 1,
      newIndex: 0,
      item: draggingCell,
      to: document.createElement('tr')
    })

    const payload = wrapper.emitted('column-order-change')?.[0]?.[0] as
      | FlTableColumnOrderChangePayload
      | undefined

    expect(payload?.oldIndex).toBe(1)
    expect(payload?.newIndex).toBe(0)
    expect(payload?.columnIndex).toBe(1)
    expect(payload?.order).toEqual([1, 0])
  })

  it('reorders rendered columns when column drag order changes', async () => {
    const rows = createRows()
    const wrapper = mount(FlTable, {
      props: {
        data: rows
      },
      slots: {
        default: () => createPlainColumns()
      }
    })

    await nextTick()
    await nextTick()

    const table = wrapper.getComponent(ElTable)
    const tableVm = table.vm as unknown as {
      store?: {
        states?: {
          columns?: {
            value?: Array<{ property?: string }>
          }
        }
      }
    }

    const readColumnProps = () =>
      (tableVm.store?.states?.columns?.value ?? [])
        .map((column) => column.property)
        .filter((value): value is string => Boolean(value))

    expect(readColumnProps().slice(0, 3)).toEqual(['name', 'age', 'id'])

    const columnCall = sortableCreate.mock.calls.find(
      (call) => (call[1] as Record<string, unknown>).draggable === 'th.el-table__cell'
    )
    expect(columnCall).toBeDefined()

    const columnOptions = columnCall?.[1] as Record<
      string,
      (event: Record<string, unknown>) => void
    >

    const draggingCell = document.createElement('th')

    columnOptions.onEnd?.({
      oldIndex: 0,
      newIndex: 2,
      item: draggingCell,
      to: document.createElement('tr')
    })

    await nextTick()
    await nextTick()

    expect(readColumnProps().slice(0, 3)).toEqual(['age', 'id', 'name'])

    const firstRowCells = wrapper
      .findAll('.el-table__body-wrapper tbody tr:first-child td .cell')
      .map((cell) => cell.text().trim())
      .filter(Boolean)

    expect(firstRowCells.slice(0, 3)).toEqual(['18', '1', 'A'])
  })

  it('applies column drag indicator to header/body by pointer side and clears out-of-range', async () => {
    const rows = createRows()
    const wrapper = mount(FlTable, {
      props: {
        data: rows
      },
      slots: {
        default: () => createPlainColumns()
      }
    })

    await nextTick()
    await nextTick()

    const columnCall = sortableCreate.mock.calls.find(
      (call) => (call[1] as Record<string, unknown>).draggable === 'th.el-table__cell'
    )
    expect(columnCall).toBeDefined()

    const columnOptions = columnCall?.[1] as Record<string, (...args: unknown[]) => unknown>
    const headerRow = columnCall?.[0] as HTMLElement
    const headerCells = Array.from(headerRow.querySelectorAll<HTMLElement>('th.el-table__cell'))

    expect(headerCells.length).toBeGreaterThanOrEqual(3)
    if (headerCells.length < 3) {
      throw new Error('header cells missing')
    }

    setElementRect(headerRow, { left: 0, top: 0, width: 300, height: 40 })
    headerCells.forEach((cell, index) => {
      setElementRect(cell, { left: index * 100, top: 0, width: 100, height: 40 })
    })

    const firstRowTds = wrapper.findAll('.el-table__body-wrapper tbody tr:first-child td')
    expect(firstRowTds.length).toBeGreaterThanOrEqual(3)

    columnOptions.onStart?.({ oldIndex: 0 })
    document.dispatchEvent(
      new MouseEvent('dragover', {
        clientX: 130,
        clientY: 20
      })
    )

    await nextTick()

    expect(headerCells[1].classList.contains('fl-table__column-drag-indicator-left')).toBe(true)
    expect(firstRowTds[1]?.classes()).toContain('fl-table__column-drag-indicator-left')

    document.dispatchEvent(
      new MouseEvent('dragover', {
        clientX: 170,
        clientY: 20
      })
    )

    await nextTick()

    expect(headerCells[1].classList.contains('fl-table__column-drag-indicator-right')).toBe(true)
    expect(firstRowTds[1]?.classes()).toContain('fl-table__column-drag-indicator-right')

    document.dispatchEvent(
      new MouseEvent('dragover', {
        clientX: 20,
        clientY: 20
      })
    )

    await nextTick()

    expect(headerCells[0].classList.contains('fl-table__column-drag-indicator-left')).toBe(true)
    expect(firstRowTds[0]?.classes()).toContain('fl-table__column-drag-indicator-left')

    document.dispatchEvent(
      new MouseEvent('mousemove', {
        clientX: 320,
        clientY: 200
      })
    )

    await nextTick()

    expect(headerCells[1].classList.contains('fl-table__column-drag-indicator-left')).toBe(false)
    expect(headerCells[1].classList.contains('fl-table__column-drag-indicator-right')).toBe(false)
    expect(firstRowTds[1]?.classes()).not.toContain('fl-table__column-drag-indicator-left')
    expect(firstRowTds[1]?.classes()).not.toContain('fl-table__column-drag-indicator-right')
  })

  it('does not trigger column reorder when pointer starts in resize hotzone', async () => {
    const rows = createRows()
    const wrapper = mount(FlTable, {
      props: {
        data: rows
      },
      slots: {
        default: () => createPlainColumns()
      }
    })

    await nextTick()
    await nextTick()

    const columnCall = sortableCreate.mock.calls.find(
      (call) => (call[1] as Record<string, unknown>).draggable === 'th.el-table__cell'
    )
    expect(columnCall).toBeDefined()

    const columnOptions = columnCall?.[1] as Record<string, (...args: unknown[]) => unknown>
    const headerRow = columnCall?.[0] as HTMLElement
    const headerCells = Array.from(headerRow.querySelectorAll<HTMLElement>('th.el-table__cell'))

    expect(headerCells.length).toBeGreaterThanOrEqual(3)
    if (headerCells.length < 3) {
      throw new Error('header cells missing')
    }

    setElementRect(headerRow, { left: 0, top: 0, width: 300, height: 40 })
    headerCells.forEach((cell, index) => {
      setElementRect(cell, { left: index * 100, top: 0, width: 100, height: 40 })
    })

    const firstRowTds = wrapper.findAll('.el-table__body-wrapper tbody tr:first-child td')
    expect(firstRowTds.length).toBeGreaterThanOrEqual(3)

    headerCells[1]?.dispatchEvent(
      new MouseEvent('mousedown', {
        bubbles: true,
        clientX: 101,
        clientY: 20
      })
    )

    columnOptions.onStart?.({ oldIndex: 1 })
    document.dispatchEvent(
      new MouseEvent('dragover', {
        clientX: 150,
        clientY: 20
      })
    )

    await nextTick()

    expect(wrapper.emitted('column-drag-start')).toBeUndefined()
    expect(wrapper.emitted('column-order-change')).toBeUndefined()
    expect(headerCells[1].classList.contains('fl-table__column-drag-indicator-left')).toBe(false)
    expect(headerCells[1].classList.contains('fl-table__column-drag-indicator-right')).toBe(false)
    expect(firstRowTds[1]?.classes()).not.toContain('fl-table__column-drag-indicator-left')
    expect(firstRowTds[1]?.classes()).not.toContain('fl-table__column-drag-indicator-right')

    document.dispatchEvent(
      new MouseEvent('mouseup', {
        clientX: 101,
        clientY: 20
      })
    )

    columnOptions.onStart?.({ oldIndex: 1 })
    columnOptions.onEnd?.({ oldIndex: 1, newIndex: 0 })

    await nextTick()

    const payload = wrapper.emitted('column-order-change')?.[0]?.[0] as
      | FlTableColumnOrderChangePayload
      | undefined

    expect(payload?.oldIndex).toBe(1)
    expect(payload?.newIndex).toBe(0)
  })
  it('reorders columns when dragged header has no source-index dataset', async () => {
    const rows = createRows()
    const wrapper = mount(FlTable, {
      props: {
        data: rows
      },
      slots: {
        default: () => createPlainColumns()
      }
    })

    await nextTick()
    await nextTick()

    const table = wrapper.getComponent(ElTable)
    const tableVm = table.vm as unknown as {
      store?: {
        states?: {
          columns?: {
            value?: Array<{ property?: string }>
          }
        }
      }
    }

    const readColumnProps = () =>
      (tableVm.store?.states?.columns?.value ?? [])
        .map((column) => column.property)
        .filter((value): value is string => Boolean(value))

    const columnCall = sortableCreate.mock.calls.find(
      (call) => (call[1] as Record<string, unknown>).draggable === 'th.el-table__cell'
    )
    expect(columnCall).toBeDefined()

    const columnOptions = columnCall?.[1] as Record<
      string,
      (event: Record<string, unknown>) => void
    >

    const draggingCell = document.createElement('th')
    columnOptions.onEnd?.({
      oldIndex: 0,
      newIndex: 2,
      item: draggingCell,
      to: document.createElement('tr')
    })

    await nextTick()
    await nextTick()

    const payload = wrapper.emitted('column-order-change')?.[0]?.[0] as
      | FlTableColumnOrderChangePayload
      | undefined
    expect(payload?.columnIndex).toBe(0)
    expect(payload?.order).toEqual([1, 2, 0])
    expect(readColumnProps().slice(0, 3)).toEqual(['age', 'id', 'name'])
  })

  it('supports public type exports', () => {
    type TypeSmoke = [
      FlTableProps,
      FlTableSelectionRowTogglePayload,
      FlTableCellChangePayload,
      FlTableRowOrderChangePayload,
      FlTableColumnOrderChangePayload
    ]

    const typeSmoke: TypeSmoke | null = null
    expect(typeSmoke).toBeNull()
  })
})
