import { mount } from '@vue/test-utils'
import { ElTable, ElTableColumn } from 'element-plus'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import type {
  CellChangeEvent,
  ColumnOrderChangeEvent,
  RowData,
  RowOrderChangeEvent,
  SelectionRowToggleEvent,
  TableProps
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

type TestRowData = {
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

const createRows = (): TestRowData[] => [
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

const getStoreColumns = (wrapper: ReturnType<typeof mount>) => {
  const table = wrapper.getComponent(ElTable)
  const tableVm = table.vm as unknown as {
    store?: {
      states?: {
        columns?: {
          value?: Array<{ property?: string; type?: string; columnKey?: string }>
        }
      }
    }
  }

  return tableVm.store?.states?.columns?.value ?? []
}

const emitCellClick = async (
  wrapper: ReturnType<typeof mount>,
  row: RowData,
  columnIndex: number,
  eventInit: MouseEventInit = {}
) => {
  const table = wrapper.getComponent(ElTable)
  const columns = getStoreColumns(wrapper)
  const cells = wrapper.findAll('.el-table__body-wrapper tbody tr:first-child td')
  const cell = cells[columnIndex]?.element as HTMLElement | undefined

  if (!cell) {
    throw new Error(`cell ${columnIndex} missing`)
  }

  table.vm.$emit(
    'cell-click',
    row,
    columns[columnIndex],
    cell,
    new MouseEvent('click', {
      bubbles: true,
      clientX: eventInit.clientX ?? 0,
      clientY: eventInit.clientY ?? 0
    })
  )

  await nextTick()
  await nextTick()
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
      toggleRowSelection: (row: TestRowData, selected?: boolean) => void
      clearSelection: () => void
    }

    const selection: TestRowData[] = []
    tableVm.getSelectionRows = vi.fn(() => [...selection])
    tableVm.toggleRowSelection = vi.fn((row: TestRowData, selected = false) => {
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
      | SelectionRowToggleEvent
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
      toggleRowSelection: (row: TestRowData, selected?: boolean) => void
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
    const proxiedRows = table.props('data') as TestRowData[]

    proxiedRows[0].profile.nickname = 'A-2'
    await nextTick()

    const payload = wrapper.emitted('cell-change')?.[0]?.[0] as CellChangeEvent | undefined

    expect(payload?.rowIndex).toBe(0)
    expect(payload?.rowKey).toBe(1)
    expect(payload?.columnKey).toBe('profile')
    expect(payload?.path).toBe('profile.nickname')
    expect(payload?.prevValue).toBe('A-1')
    expect(payload?.nextValue).toBe('A-2')
  })

  it('does not apply cross highlight classes when crossHighlight is disabled', async () => {
    const rows = createRows()
    const wrapper = mount(FlTable, {
      props: {
        data: rows,
        crossHighlight: false
      },
      slots: {
        default: () => createPlainColumns()
      }
    })

    await nextTick()
    await nextTick()
    await emitCellClick(wrapper, rows[0], 1)

    const headerCells = wrapper.findAll('.el-table__header-wrapper th.el-table__cell')
    const bodyCells = wrapper.findAll('.el-table__body-wrapper tbody tr:first-child td')

    expect(headerCells.some((cell) => cell.classes().some((name) => name.includes('cross-')))).toBe(
      false
    )
    expect(bodyCells.some((cell) => cell.classes().some((name) => name.includes('cross-')))).toBe(
      false
    )
  })

  it('applies row, column, and active classes when crossHighlight is enabled', async () => {
    const rows = createRows()
    const wrapper = mount(FlTable, {
      props: {
        data: rows,
        crossHighlight: true
      },
      slots: {
        default: () => createPlainColumns()
      }
    })

    await nextTick()
    await nextTick()
    await emitCellClick(wrapper, rows[0], 1)

    const headerCells = wrapper.findAll('.el-table__header-wrapper th.el-table__cell')
    const firstRowCells = wrapper.findAll('.el-table__body-wrapper tbody tr:first-child td')
    const secondRowCells = wrapper.findAll('.el-table__body-wrapper tbody tr:nth-child(2) td')

    expect(headerCells[1]?.classes()).toContain('fl-table__cross-column')
    expect(firstRowCells[0]?.classes()).toContain('fl-table__cross-row')
    expect(firstRowCells[1]?.classes()).toContain('fl-table__cross-active')
    expect(firstRowCells[1]?.classes()).not.toContain('fl-table__cross-row')
    expect(firstRowCells[1]?.classes()).not.toContain('fl-table__cross-column')
    expect(secondRowCells[1]?.classes()).toContain('fl-table__cross-column')
  })

  it('clears cross highlight when clicking outside the table', async () => {
    const rows = createRows()
    const wrapper = mount(FlTable, {
      props: {
        data: rows,
        crossHighlight: true
      },
      slots: {
        default: () => createPlainColumns()
      }
    })

    await nextTick()
    await nextTick()
    await emitCellClick(wrapper, rows[0], 1)

    const outside = document.createElement('button')
    document.body.appendChild(outside)
    outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))

    await nextTick()
    await nextTick()

    const headerCells = wrapper.findAll('.el-table__header-wrapper th.el-table__cell')
    const firstRowCells = wrapper.findAll('.el-table__body-wrapper tbody tr:first-child td')

    expect(headerCells[1]?.classes()).not.toContain('fl-table__cross-column')
    expect(firstRowCells[0]?.classes()).not.toContain('fl-table__cross-row')
    expect(firstRowCells[1]?.classes()).not.toContain('fl-table__cross-active')

    outside.remove()
  })

  it('skips control columns for cross highlight', async () => {
    const rows = createRows()
    const wrapper = mount(FlTable, {
      props: {
        data: rows,
        crossHighlight: true
      },
      slots: {
        default: () => createColumns()
      }
    })

    await nextTick()
    await nextTick()
    await emitCellClick(wrapper, rows[0], 0)

    const headerCells = wrapper.findAll('.el-table__header-wrapper th.el-table__cell')
    const firstRowCells = wrapper.findAll('.el-table__body-wrapper tbody tr:first-child td')

    expect(headerCells.some((cell) => cell.classes().some((name) => name.includes('cross-')))).toBe(
      false
    )
    expect(
      firstRowCells.some((cell) => cell.classes().some((name) => name.includes('cross-')))
    ).toBe(false)

    await emitCellClick(wrapper, rows[0], 1)

    expect(firstRowCells[0]?.classes()).not.toContain('fl-table__cross-row')
    expect(firstRowCells[1]?.classes()).toContain('fl-table__cross-active')
  })

  it('does not activate cross highlight when clicking the row drag handle hotzone', async () => {
    const rows = createRows()
    const wrapper = mount(FlTable, {
      props: {
        data: rows,
        crossHighlight: true,
        rowDraggable: true
      },
      slots: {
        default: () => createPlainColumns()
      }
    })

    await nextTick()
    await nextTick()

    const firstRowCells = wrapper.findAll('.el-table__body-wrapper tbody tr:first-child td')
    const firstCell = firstRowCells[0]?.element as HTMLElement | undefined

    if (!firstCell) {
      throw new Error('first row first cell missing')
    }

    setElementRect(firstCell, { left: 0, top: 0, width: 120, height: 40 })

    await emitCellClick(wrapper, rows[0], 0, { clientX: 12, clientY: 20 })

    expect(firstRowCells[0]?.classes()).not.toContain('fl-table__cross-active')
    expect(firstRowCells[0]?.classes()).not.toContain('fl-table__cross-row')

    await emitCellClick(wrapper, rows[0], 0, { clientX: 72, clientY: 20 })

    expect(firstRowCells[0]?.classes()).toContain('fl-table__cross-active')
  })

  it('clears active cross highlight when source columns change', async () => {
    const rows = createRows()
    const Host = defineComponent({
      components: { FlTable, ElTableColumn },
      setup() {
        const showId = ref(true)
        return {
          rows,
          showId
        }
      },
      render() {
        return h(
          FlTable,
          {
            data: this.rows,
            crossHighlight: true
          },
          {
            default: () => [
              h(ElTableColumn, { prop: 'name', label: 'Name' }),
              h(ElTableColumn, { prop: 'age', label: 'Age' }),
              ...(this.showId ? [h(ElTableColumn, { prop: 'id', label: 'ID' })] : [])
            ]
          }
        )
      }
    })

    const wrapper = mount(Host)

    await nextTick()
    await nextTick()

    const tableWrapper = wrapper.getComponent(FlTable)
    await emitCellClick(tableWrapper, rows[0], 2)

    expect(
      tableWrapper.findAll('.el-table__body-wrapper tbody tr:first-child td')[2]?.classes()
    ).toContain('fl-table__cross-active')
    ;(wrapper.vm as unknown as { showId: boolean }).showId = false
    await nextTick()
    await nextTick()

    const nextTableWrapper = wrapper.getComponent(FlTable)
    const firstRowCells = nextTableWrapper.findAll(
      '.el-table__body-wrapper tbody tr:first-child td'
    )

    expect(
      firstRowCells.some((cell) => cell.classes().some((name) => name.includes('cross-')))
    ).toBe(false)
  })

  it('does not activate cross highlight when rowKeyField is missing', async () => {
    const rows = createRows()
    const wrapper = mount(FlTable, {
      props: {
        data: rows,
        crossHighlight: true,
        rowKeyField: 'missing'
      },
      slots: {
        default: () => createPlainColumns()
      }
    })

    await nextTick()
    await nextTick()
    await emitCellClick(wrapper, rows[0], 1)

    const firstRowCells = wrapper.findAll('.el-table__body-wrapper tbody tr:first-child td')
    expect(
      firstRowCells.some((cell) => cell.classes().some((name) => name.includes('cross-')))
    ).toBe(false)
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
      | RowOrderChangeEvent
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
      | ColumnOrderChangeEvent
      | undefined

    expect(payload?.oldIndex).toBe(1)
    expect(payload?.newIndex).toBe(0)
    expect(payload?.columnIndex).toBe(1)
    expect(payload?.order).toEqual([1, 0, 2])
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

  it('keeps full column order when drag lifecycle column count shrinks temporarily', async () => {
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
    const internalInstance = (wrapper.vm as unknown as { $?: Record<string, unknown> }).$ as
      | {
          devtoolsRawSetupState?: Record<string, { value: unknown }>
          setupState?: Record<string, { value: unknown }>
        }
      | undefined
    const setupState =
      internalInstance?.devtoolsRawSetupState ?? internalInstance?.setupState ?? undefined

    if (!setupState) {
      throw new Error('component setup state missing')
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
    const visibleColumnCount = setupState.visibleColumnCount as { value: number }

    columnOptions.onStart?.({ oldIndex: 0 })
    visibleColumnCount.value = 2

    columnOptions.onEnd?.({
      oldIndex: 0,
      newIndex: 1,
      item: document.createElement('th'),
      to: document.createElement('tr')
    })

    await nextTick()
    await nextTick()

    expect(wrapper.emitted('column-order-change')?.[0]?.[0]).toMatchObject({
      oldIndex: 0,
      newIndex: 1,
      order: [1, 0, 2]
    })
    expect(readColumnProps().slice(0, 3)).toEqual(['age', 'name', 'id'])

    const firstRowCells = wrapper
      .findAll('.el-table__body-wrapper tbody tr:first-child td .cell')
      .map((cell) => cell.text().trim())
      .filter(Boolean)

    expect(firstRowCells.slice(0, 3)).toEqual(['18', 'A', '1'])
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
      | ColumnOrderChangeEvent
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
      | ColumnOrderChangeEvent
      | undefined
    expect(payload?.columnIndex).toBe(0)
    expect(payload?.order).toEqual([1, 2, 0])
    expect(readColumnProps().slice(0, 3)).toEqual(['age', 'id', 'name'])
  })

  it('supports public type exports', () => {
    type TypeSmoke = [
      TableProps,
      RowData,
      SelectionRowToggleEvent,
      CellChangeEvent,
      RowOrderChangeEvent,
      ColumnOrderChangeEvent
    ]

    const typeSmoke: TypeSmoke | null = null
    expect(typeSmoke).toBeNull()
  })
})
