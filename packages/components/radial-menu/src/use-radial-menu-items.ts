import type {
  FlRadialMenuItemData,
  FlRadialMenuResolvableItem,
  FlRadialMenuResolvedItem
} from './types'

interface RadialMenuItemVisibility {
  hidden?: boolean
}

export interface RadialMenuSplitItems<
  T extends RadialMenuItemVisibility = FlRadialMenuResolvedItem
> {
  visibleItems: T[]
  ringItems: T[]
  moreItems: T[]
  ringLimit: number
}

export interface NormalizeRadialMenuItemsOptions {
  warn?: (message: string) => void
}

export const clampRingItemCount = (maxRingItems: number) => {
  if (!Number.isFinite(maxRingItems)) {
    return 6
  }

  return Math.min(Math.max(Math.trunc(maxRingItems), 1), 6)
}

export const resolveRadialMenuItemIndex = (item: FlRadialMenuItemData) => {
  const rawIndex = item.index ?? item.key

  if (rawIndex === undefined || rawIndex === null || rawIndex === '') {
    return ''
  }

  return String(rawIndex)
}

export const normalizeRadialMenuItems = (
  items: FlRadialMenuResolvableItem[],
  options: NormalizeRadialMenuItemsOptions = {}
): FlRadialMenuResolvedItem[] => {
  const seenIndexes = new Set<string>()
  const normalizedItems: FlRadialMenuResolvedItem[] = []

  for (const item of items) {
    const index = resolveRadialMenuItemIndex(item)

    if (!index) {
      options.warn?.('Missing required prop: "index"')
      continue
    }

    if (seenIndexes.has(index)) {
      options.warn?.(`Duplicate item index detected: ${index}`)
      continue
    }

    seenIndexes.add(index)
    normalizedItems.push({
      ...item,
      index
    })
  }

  return normalizedItems
}

export const splitRadialMenuItems = <T extends RadialMenuItemVisibility>(
  items: T[],
  maxRingItems: number
): RadialMenuSplitItems<T> => {
  const ringLimit = clampRingItemCount(maxRingItems)
  const visibleItems = items.filter((item) => !item.hidden)

  return {
    visibleItems,
    ringItems: visibleItems.slice(0, ringLimit),
    moreItems: visibleItems.slice(ringLimit),
    ringLimit
  }
}

export const isRadialMenuItemDisabled = (item: FlRadialMenuResolvedItem | undefined) =>
  item?.disabled === true
