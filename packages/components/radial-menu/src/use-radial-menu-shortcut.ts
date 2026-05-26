import { onMounted, onUnmounted, type Ref } from 'vue'
import type { FlRadialMenuOpenOptions } from './types'

export interface UseRadialMenuShortcutOptions {
  shortcut: Ref<string>
  enabled: Ref<boolean>
  open: (options: FlRadialMenuOpenOptions) => void
}

const modifierKeys = new Set(['alt', 'ctrl', 'control', 'meta', 'shift'])

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  const tagName = target.tagName.toLowerCase()
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    target.isContentEditable
  )
}

const normalizeShortcut = (value: string) =>
  value
    .split('+')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)

const matchesShortcut = (event: KeyboardEvent, shortcut: string) => {
  const parts = normalizeShortcut(shortcut)
  if (parts.length === 0) {
    return false
  }

  const key = parts.find((part) => !modifierKeys.has(part))
  const expectsAlt = parts.includes('alt')
  const expectsCtrl = parts.includes('ctrl') || parts.includes('control')
  const expectsMeta = parts.includes('meta')
  const expectsShift = parts.includes('shift')

  return (
    event.altKey === expectsAlt &&
    event.ctrlKey === expectsCtrl &&
    event.metaKey === expectsMeta &&
    event.shiftKey === expectsShift &&
    event.key.toLowerCase() === key
  )
}

const getViewportCenter = () => ({
  x: typeof window === 'undefined' ? 0 : window.innerWidth / 2,
  y: typeof window === 'undefined' ? 0 : window.innerHeight / 2
})

export const useRadialMenuShortcut = ({
  shortcut,
  enabled,
  open
}: UseRadialMenuShortcutOptions) => {
  const center = getViewportCenter()
  let lastMouseX = center.x
  let lastMouseY = center.y

  const handleMouseMove = (event: MouseEvent) => {
    lastMouseX = event.clientX
    lastMouseY = event.clientY
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if (
      !enabled.value ||
      !matchesShortcut(event, shortcut.value) ||
      isEditableTarget(event.target)
    ) {
      return
    }

    event.preventDefault()
    open({
      x: lastMouseX,
      y: lastMouseY,
      reason: 'shortcut'
    })
  }

  onMounted(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('keydown', handleKeydown)
  })
}
