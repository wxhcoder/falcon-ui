import { describe, expect, it, vi } from 'vitest'
import type { TableEditorEndpoint } from '../src/editor-registry'
import { createTableEditorRegistry } from '../src/editor-registry'

const createCell = () => {
  const cell = document.createElement('td')
  cell.className = 'el-table__cell'
  const root = document.createElement('span')
  cell.appendChild(root)
  document.body.appendChild(cell)
  return { cell, root }
}

const createEndpoint = (root: HTMLElement): TableEditorEndpoint => ({
  id: Symbol('editor'),
  getRootEl: vi.fn(() => root),
  focus: vi.fn(),
  blur: vi.fn(),
  handoffFirstKey: vi.fn(async () => false)
})

describe('createTableEditorRegistry', () => {
  it('only checks editors registered in the requested cell on the fast path', () => {
    const registry = createTableEditorRegistry()
    const first = createCell()
    const second = createCell()
    const firstEndpoint = createEndpoint(first.root)
    const secondEndpoint = createEndpoint(second.root)

    registry.register(firstEndpoint)
    registry.register(secondEndpoint)
    vi.mocked(firstEndpoint.getRootEl).mockClear()
    vi.mocked(secondEndpoint.getRootEl).mockClear()

    expect(registry.getEditorsInCells([first.cell])).toEqual([firstEndpoint])
    expect(firstEndpoint.getRootEl).toHaveBeenCalledOnce()
    expect(secondEndpoint.getRootEl).not.toHaveBeenCalled()

    first.cell.remove()
    second.cell.remove()
  })

  it('rebuilds the cell index after structural invalidation and supports unregistering', () => {
    const registry = createTableEditorRegistry()
    const first = createCell()
    const second = createCell()
    const endpoint = createEndpoint(first.root)
    const unregister = registry.register(endpoint)

    second.cell.appendChild(first.root)
    registry.invalidate()

    expect(registry.getEditorsInCells([second.cell])).toEqual([endpoint])

    unregister()
    expect(registry.getEditorsInCells([second.cell])).toEqual([])

    first.cell.remove()
    second.cell.remove()
  })
})
