import type { ComponentPublicInstance } from 'vue'

export type TableEditorMode = 'text' | 'controlled'

export type TableEditorTarget = ComponentPublicInstance | HTMLElement | null

export type TableEditorEndpoint = {
  id: symbol
  getRootEl: () => HTMLElement | null
  focus: () => void | Promise<void>
  blur: () => void | Promise<void>
  handoffFirstKey: (event: KeyboardEvent) => Promise<boolean>
  open?: () => void | Promise<void>
  close?: () => void | Promise<void>
  isFixedClone?: boolean
  priority?: number
}

export type TableEditorRegistry = {
  register: (endpoint: TableEditorEndpoint) => () => void
  getEditors: () => TableEditorEndpoint[]
}

export const tableEditorRegistryDomKey = Symbol('fl-table-editor-registry')
