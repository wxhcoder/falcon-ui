import type { ComponentPublicInstance } from 'vue'

export type TableEditorMode = 'text' | 'controlled'

export type TableEditorTarget = ComponentPublicInstance | HTMLElement | null

export type TableEditorEndpoint = {
  id: symbol
  getRootEl: () => HTMLElement | null
  focus: () => void | Promise<void>
  blur: () => void | Promise<void>
  handoffFirstKey: (event: KeyboardEvent) => Promise<boolean>
  isPanelOpen?: () => boolean
  open?: () => void | Promise<void>
  close?: () => void | Promise<void>
  isFixedClone?: boolean
  priority?: number
}

export type TableEditorRegistry = {
  register: (endpoint: TableEditorEndpoint) => () => void
  getEditors: () => TableEditorEndpoint[]
  getEditorsInCells: (cells: HTMLElement[]) => TableEditorEndpoint[]
  invalidate: () => void
  refresh: () => void
}

export const tableEditorRegistryDomKey = Symbol('fl-table-editor-registry')

type EditorRecord = {
  endpoint: TableEditorEndpoint
  cell: HTMLElement | null
}

const resolveEditorCell = (endpoint: TableEditorEndpoint): HTMLElement | null => {
  const cell = endpoint.getRootEl()?.closest('td.el-table__cell')
  return cell instanceof HTMLElement ? cell : null
}

export const createTableEditorRegistry = (): TableEditorRegistry => {
  const records = new Map<symbol, EditorRecord>()
  const unindexedIds = new Set<symbol>()
  let idsByCell = new WeakMap<HTMLElement, Set<symbol>>()
  let isIndexDirty = false

  const detachRecord = (record: EditorRecord) => {
    if (!record.cell) {
      unindexedIds.delete(record.endpoint.id)
      return
    }

    const ids = idsByCell.get(record.cell)
    ids?.delete(record.endpoint.id)
    if (ids?.size === 0) {
      idsByCell.delete(record.cell)
    }
    record.cell = null
  }

  const indexRecord = (record: EditorRecord) => {
    detachRecord(record)
    const cell = resolveEditorCell(record.endpoint)
    record.cell = cell

    if (!cell) {
      unindexedIds.add(record.endpoint.id)
      return
    }

    const ids = idsByCell.get(cell) ?? new Set<symbol>()
    ids.add(record.endpoint.id)
    idsByCell.set(cell, ids)
  }

  const refresh = () => {
    idsByCell = new WeakMap<HTMLElement, Set<symbol>>()
    unindexedIds.clear()
    for (const record of records.values()) {
      record.cell = null
      indexRecord(record)
    }
    isIndexDirty = false
  }

  const refreshUnindexed = () => {
    for (const id of [...unindexedIds]) {
      const record = records.get(id)
      if (record) {
        indexRecord(record)
      } else {
        unindexedIds.delete(id)
      }
    }
  }

  return {
    register(endpoint) {
      const previous = records.get(endpoint.id)
      if (previous) {
        detachRecord(previous)
      }

      const record: EditorRecord = { endpoint, cell: null }
      records.set(endpoint.id, record)
      indexRecord(record)

      return () => {
        const current = records.get(endpoint.id)
        if (current?.endpoint !== endpoint) {
          return
        }

        detachRecord(current)
        records.delete(endpoint.id)
      }
    },
    getEditors: () => [...records.values()].map((record) => record.endpoint),
    getEditorsInCells(cells) {
      if (cells.length === 0) {
        return []
      }
      if (isIndexDirty) {
        refresh()
      } else if (unindexedIds.size > 0) {
        refreshUnindexed()
      }

      const cellSet = new Set(cells)
      const candidateIds = new Set<symbol>()
      for (const cell of cells) {
        for (const id of idsByCell.get(cell) ?? []) {
          candidateIds.add(id)
        }
      }

      const candidates: TableEditorEndpoint[] = []
      for (const id of candidateIds) {
        const record = records.get(id)
        if (!record) {
          continue
        }

        const root = record.endpoint.getRootEl()
        if (root && cells.some((cell) => cell.contains(root))) {
          candidates.push(record.endpoint)
          continue
        }

        indexRecord(record)
        if (record.cell && cellSet.has(record.cell)) {
          candidates.push(record.endpoint)
        }
      }

      return candidates
    },
    invalidate: () => {
      isIndexDirty = true
    },
    refresh
  }
}
