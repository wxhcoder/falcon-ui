import type { Component } from 'vue'

export interface FlRadialMenuItem {
  key: string | number
  label: string
  icon?: Component | string
  shortcut?: string
  disabled?: boolean
  hidden?: boolean
  divided?: boolean
  closeOnSelect?: boolean
  meta?: Record<string, unknown>
}

export type FlRadialMenuMode = 'inline' | 'floating'
export type FlRadialMenuTrigger = 'click' | 'hover' | 'manual'
export type FlRadialMenuMoreMode = 'ellipsis' | 'text' | 'text-ellipsis'
export type FlRadialMenuDropdownPlacement = 'bottom' | 'top'
export type FlRadialMenuOpenReason = 'click' | 'hover' | 'manual' | 'shortcut'
export type FlRadialMenuCloseReason =
  | 'click-outside'
  | 'select'
  | 'escape'
  | 'manual'
  | 'hover-leave'

export interface FlRadialMenuOpenOptions {
  x?: number
  y?: number
  reason?: FlRadialMenuOpenReason
}

export interface FlRadialMenuSelectContext {
  source: 'ring' | 'more'
  index: number
  event: MouseEvent | KeyboardEvent
}

export interface FlRadialMenuExpose {
  open: (options?: FlRadialMenuOpenOptions) => void
  close: (reason?: FlRadialMenuCloseReason) => void
  toggle: (options?: FlRadialMenuOpenOptions) => void
  focus: () => void
}
