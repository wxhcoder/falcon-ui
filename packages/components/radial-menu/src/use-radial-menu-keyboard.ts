import type { Ref } from 'vue'
import type { FlRadialMenuResolvedItem } from './types'

export interface UseRadialMenuKeyboardOptions {
  ringItems: Ref<FlRadialMenuResolvedItem[]>
  moreItems: Ref<FlRadialMenuResolvedItem[]>
  ringRefs: Ref<HTMLButtonElement[]>
  moreRefs: Ref<HTMLButtonElement[]>
  closeMenu: () => void
  closeMore: () => void
  activateFocused: (event: KeyboardEvent) => void
}

const findNextEnabledIndex = (
  items: FlRadialMenuResolvedItem[],
  currentIndex: number,
  direction: 1 | -1
) => {
  if (items.length === 0) {
    return -1
  }

  for (let step = 1; step <= items.length; step += 1) {
    const nextIndex = (currentIndex + step * direction + items.length) % items.length
    if (!items[nextIndex]?.disabled) {
      return nextIndex
    }
  }

  return -1
}

export const useRadialMenuKeyboard = ({
  ringItems,
  moreItems,
  ringRefs,
  moreRefs,
  closeMenu,
  closeMore,
  activateFocused
}: UseRadialMenuKeyboardOptions) => {
  const focusRingItem = (index: number) => {
    ringRefs.value[index]?.focus()
  }

  const focusFirstAvailableRingItem = () => {
    const index = findNextEnabledIndex(ringItems.value, -1, 1)
    if (index >= 0) {
      focusRingItem(index)
    }
  }

  const handleRingKeydown = (event: KeyboardEvent, index: number) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      const nextIndex = findNextEnabledIndex(ringItems.value, index, 1)
      if (nextIndex >= 0) {
        focusRingItem(nextIndex)
      }
      return
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      const nextIndex = findNextEnabledIndex(ringItems.value, index, -1)
      if (nextIndex >= 0) {
        focusRingItem(nextIndex)
      }
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      activateFocused(event)
    }
  }

  const handleMoreKeydown = (event: KeyboardEvent, index: number) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      const nextIndex = findNextEnabledIndex(moreItems.value, index, 1)
      moreRefs.value[nextIndex]?.focus()
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      const nextIndex = findNextEnabledIndex(moreItems.value, index, -1)
      moreRefs.value[nextIndex]?.focus()
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      activateFocused(event)
    }
  }

  const handleMenuKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      closeMore()
      closeMenu()
    }
  }

  return {
    focusFirstAvailableRingItem,
    handleMenuKeydown,
    handleRingKeydown,
    handleMoreKeydown
  }
}
