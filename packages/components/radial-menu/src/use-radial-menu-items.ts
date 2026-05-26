import type { FlRadialMenuItem } from './types'

export interface RadialMenuSplitItems {
  visibleItems: FlRadialMenuItem[]
  ringItems: FlRadialMenuItem[]
  moreItems: FlRadialMenuItem[]
  ringLimit: number
}

export const clampRingItemCount = (maxRingItems: number) => {
  if (!Number.isFinite(maxRingItems)) {
    return 6
  }

  return Math.min(Math.max(Math.trunc(maxRingItems), 1), 6)
}

export const splitRadialMenuItems = (
  items: FlRadialMenuItem[],
  maxRingItems: number
): RadialMenuSplitItems => {
  const ringLimit = clampRingItemCount(maxRingItems)
  const visibleItems = items.filter((item) => !item.hidden)

  return {
    visibleItems,
    ringItems: visibleItems.slice(0, ringLimit),
    moreItems: visibleItems.slice(ringLimit),
    ringLimit
  }
}

export const isRadialMenuItemDisabled = (item: FlRadialMenuItem | undefined) =>
  item?.disabled === true
