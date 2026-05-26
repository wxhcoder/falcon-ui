import { describe, expect, it } from 'vitest'
import { splitRadialMenuItems } from '../src/use-radial-menu-items'
import { getRadialMenuItemLayout, getRadialMenuSectorPath } from '../src/use-radial-menu-position'
import type { FlRadialMenuItem } from '../src/types'

const createItems = (count: number): FlRadialMenuItem[] =>
  Array.from({ length: count }, (_, index) => ({
    key: `item-${index + 1}`,
    label: `Item ${index + 1}`
  }))

describe('radial menu helpers', () => {
  it('filters hidden items and limits ring items to six', () => {
    const items = [
      ...createItems(3),
      { key: 'hidden', label: 'Hidden', hidden: true },
      ...createItems(5).map((item) => ({
        ...item,
        key: `extra-${item.key}`
      }))
    ]

    const result = splitRadialMenuItems(items, 10)

    expect(result.visibleItems.map((item) => item.key)).not.toContain('hidden')
    expect(result.ringItems).toHaveLength(6)
    expect(result.moreItems).toHaveLength(2)
  })

  it('clamps max ring items between one and six', () => {
    expect(splitRadialMenuItems(createItems(3), 0).ringItems).toHaveLength(1)
    expect(splitRadialMenuItems(createItems(8), 99).ringItems).toHaveLength(6)
  })

  it('places the first ring item at the top of the circle', () => {
    const layout = getRadialMenuItemLayout({
      count: 4,
      index: 0,
      radius: 96
    })

    expect(Math.round(layout.x)).toBe(0)
    expect(Math.round(layout.y)).toBe(-96)
    expect(layout.angle).toBe(-90)
  })

  it('creates a sector path for the active ring item', () => {
    const path = getRadialMenuSectorPath({
      activeIndex: 0,
      count: 6,
      innerRadius: 36,
      outerRadius: 112
    })

    expect(path).toMatch(/^M /)
    expect(path).toContain('A 112 112')
    expect(path).toContain('A 36 36')
    expect(path.endsWith(' Z')).toBe(true)
  })
})
