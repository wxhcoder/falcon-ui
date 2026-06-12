import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, markRaw, nextTick } from 'vue'
import { ElConfigProvider } from 'element-plus'
import { FlRadialMenuItem as RadialMenuItemComponent } from '..'
import RadialMenu from '../src/radial-menu.vue'
import { flRadialMenuProps } from '../src/radial-menu'
import { splitRadialMenuItems } from '../src/use-radial-menu-items'
import * as radialMenuPosition from '../src/use-radial-menu-position'
import { getRadialMenuItemLayout, getRadialMenuSectorPath } from '../src/use-radial-menu-position'
import type { FlRadialMenuItemData } from '../src/types'

type RadialMenuTrackArcPathHelper = (options: {
  activeIndex: number
  count: number
  radius: number
  innerRadius?: number
  startAngle?: number
}) => string

type RadialMenuItemTypeProp = {
  default: string
  validator?: (value: string) => boolean
}

type RadialMenuSizeProp = {
  default?: string
  validator?: (value: string) => boolean
}

type RadialMenuEntryPoint = {
  x: number
  y: number
}

type RadialMenuEntryAnimationHelpers = typeof radialMenuPosition & {
  getRadialMenuClockwiseEntryOrder?: (
    layouts: Array<Pick<radialMenuPosition.RadialMenuItemLayout, 'angle'>>,
    options?: { startAngle?: number }
  ) => number[]
  getRadialMenuClockwiseArcPoints?: (options: {
    radius: number
    targetAngle: number
    startAngle?: number
    steps?: number
  }) => RadialMenuEntryPoint[]
  normalizeRadialMenuAngle?: (angle: number) => number
}

type RadialMenuAnimateCall = {
  element: HTMLElement
  keyframes: Keyframe[] | PropertyIndexedKeyframes
  options: KeyframeAnimationOptions
}

const createItems = (count: number): FlRadialMenuItemData[] =>
  Array.from({ length: count }, (_, index) => ({
    index: `item-${index + 1}`,
    label: `Item ${index + 1}`
  }))

const readProjectFile = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), 'utf8')

const getTrackArcPathHelper = () =>
  (
    radialMenuPosition as typeof radialMenuPosition & {
      getRadialMenuTrackArcPath?: RadialMenuTrackArcPathHelper
    }
  ).getRadialMenuTrackArcPath

const getEntryAnimationHelpers = () => radialMenuPosition as RadialMenuEntryAnimationHelpers

const restoreFns: Array<() => void> = []

afterEach(() => {
  for (const restore of restoreFns.splice(0)) {
    restore()
  }

  vi.restoreAllMocks()
})

const mockElementAnimate = () => {
  const animateCalls: RadialMenuAnimateCall[] = []
  const originalAnimate = HTMLElement.prototype.animate
  const hadOwnAnimate = Object.prototype.hasOwnProperty.call(HTMLElement.prototype, 'animate')
  const animateMock = vi.fn(function (
    this: HTMLElement,
    keyframes: Keyframe[] | PropertyIndexedKeyframes,
    options?: number | KeyframeAnimationOptions
  ) {
    animateCalls.push({
      element: this,
      keyframes,
      options: typeof options === 'number' ? { duration: options } : (options ?? {})
    })

    return {
      cancel: vi.fn(),
      finished: Promise.resolve()
    } as unknown as Animation
  })

  Object.defineProperty(HTMLElement.prototype, 'animate', {
    configurable: true,
    value: animateMock
  })

  restoreFns.push(() => {
    if (hadOwnAnimate) {
      Object.defineProperty(HTMLElement.prototype, 'animate', {
        configurable: true,
        value: originalAnimate
      })
    } else {
      delete (HTMLElement.prototype as Partial<HTMLElement>).animate
    }
  })

  return { animateCalls, animateMock }
}

const stubReducedMotion = (matches: boolean) => {
  const originalMatchMedia = window.matchMedia
  const hadMatchMedia = Object.prototype.hasOwnProperty.call(window, 'matchMedia')

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  })

  restoreFns.push(() => {
    if (hadMatchMedia) {
      Object.defineProperty(window, 'matchMedia', {
        configurable: true,
        writable: true,
        value: originalMatchMedia
      })
    } else {
      delete (window as Partial<Window>).matchMedia
    }
  })
}

const flushRadialMenuEntry = async () => {
  await nextTick()
  await nextTick()
}

const getOuterArcSignature = (path: string, radius: number) => {
  const match = path.match(
    new RegExp(`^M ([^ ]+) ([^ ]+) A ${radius} ${radius} 0 ([01]) 1 ([^ ]+) ([^ ]+)`)
  )

  return match?.slice(1)
}

const mountWithGlobalSize = (size: 'large' | 'default' | 'small', radialMenuProps = {}) =>
  mount({
    render: () =>
      h(
        ElConfigProvider,
        { size },
        {
          default: () =>
            h(RadialMenu, {
              items: createItems(3),
              modelValue: true,
              ...radialMenuProps
            })
        }
      )
  })

describe('radial menu helpers', () => {
  it('filters hidden items and limits ring items to six', () => {
    const items = [
      ...createItems(3),
      { index: 'hidden', label: 'Hidden', hidden: true },
      ...createItems(5).map((item) => ({
        ...item,
        index: `extra-${item.index}`
      }))
    ]

    const result = splitRadialMenuItems(items, 10)

    expect(result.visibleItems.map((item) => item.index)).not.toContain('hidden')
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

  it('does not create a sector path when the outer radius cannot contain the inner radius', () => {
    expect(
      getRadialMenuSectorPath({
        activeIndex: 0,
        count: 6,
        innerRadius: 36,
        outerRadius: 32
      })
    ).toBe('')
  })

  it('creates an active track arc with the same outer arc as the sector', () => {
    const getRadialMenuTrackArcPath = getTrackArcPathHelper()
    const sectorPath = getRadialMenuSectorPath({
      activeIndex: 1,
      count: 4,
      innerRadius: 36,
      outerRadius: 96
    })

    expect(getRadialMenuTrackArcPath).toBeTypeOf('function')

    const trackPath = getRadialMenuTrackArcPath?.({
      activeIndex: 1,
      count: 4,
      radius: 96,
      innerRadius: 36
    })

    expect(getOuterArcSignature(trackPath ?? '', 96)).toEqual(getOuterArcSignature(sectorPath, 96))
  })

  it('does not create an active track arc when the radius cannot contain the inner radius', () => {
    const getRadialMenuTrackArcPath = getTrackArcPathHelper()

    expect(getRadialMenuTrackArcPath).toBeTypeOf('function')
    expect(
      getRadialMenuTrackArcPath?.({
        activeIndex: 0,
        count: 6,
        radius: 32,
        innerRadius: 36
      })
    ).toBe('')
  })

  it('normalizes radial menu angles to a clockwise 0-360 range', () => {
    const { normalizeRadialMenuAngle } = getEntryAnimationHelpers()

    expect(normalizeRadialMenuAngle).toBeTypeOf('function')
    expect(normalizeRadialMenuAngle?.(-90)).toBe(270)
    expect(normalizeRadialMenuAngle?.(360)).toBe(0)
    expect(normalizeRadialMenuAngle?.(450)).toBe(90)
  })

  it('creates clockwise entry arc points from the left side to the target angle', () => {
    const { getRadialMenuClockwiseArcPoints } = getEntryAnimationHelpers()

    expect(getRadialMenuClockwiseArcPoints).toBeTypeOf('function')

    const points =
      getRadialMenuClockwiseArcPoints?.({
        radius: 96,
        startAngle: 180,
        targetAngle: -90,
        steps: 5
      }) ?? []

    expect(points).toHaveLength(5)
    expect(points[0]).toEqual({ x: -96, y: 0 })
    expect(Math.round(points.at(-1)?.x ?? NaN)).toBe(0)
    expect(Math.round(points.at(-1)?.y ?? NaN)).toBe(-96)
  })

  it('orders entry delays by farthest clockwise distance from the left side first', () => {
    const { getRadialMenuClockwiseEntryOrder } = getEntryAnimationHelpers()
    const layouts = Array.from({ length: 4 }, (_, index) =>
      getRadialMenuItemLayout({
        count: 4,
        index,
        radius: 96
      })
    )

    expect(getRadialMenuClockwiseEntryOrder).toBeTypeOf('function')
    expect(getRadialMenuClockwiseEntryOrder?.(layouts, { startAngle: 180 })).toEqual([2, 1, 0, 3])
  })
})

describe('FlRadialMenu basic ring display', () => {
  it('renders only the center button before opening', () => {
    const wrapper = mount(RadialMenu, {
      props: {
        items: createItems(3),
        centerLabel: 'Tools'
      }
    })

    expect(wrapper.get('button').classes()).toContain('fl-radial-menu__center')
    expect(wrapper.get('button').text()).toContain('Tools')
    expect(wrapper.findAll('[role="menuitem"]')).toHaveLength(0)
  })

  it('opens ring items on center click', async () => {
    const wrapper = mount(RadialMenu, {
      props: {
        items: createItems(3)
      }
    })

    await wrapper.get('button').trigger('click')

    expect(wrapper.classes()).toContain('is-opened')
    expect(wrapper.findAll('[role="menuitem"]')).toHaveLength(3)
    expect(wrapper.find('[data-radial-menu-index="item-1"]').attributes('style')).toContain(
      '--fl-radial-menu-item-x'
    )
  })

  it('does not open from center click in manual trigger mode', async () => {
    const wrapper = mount(RadialMenu, {
      props: {
        items: createItems(2),
        trigger: 'manual'
      }
    })

    await wrapper.get('button').trigger('click')

    expect(wrapper.findAll('[role="menuitem"]')).toHaveLength(0)
  })

  it('supports controlled modelValue', async () => {
    const wrapper = mount(RadialMenu, {
      props: {
        items: createItems(2),
        modelValue: true
      }
    })

    expect(wrapper.findAll('[role="menuitem"]')).toHaveLength(2)

    await wrapper.setProps({ modelValue: false })

    expect(wrapper.findAll('[role="menuitem"]')).toHaveLength(0)
  })

  it('uses size classes without writing size variables inline', async () => {
    const wrapper = mount(RadialMenu, {
      props: {
        items: createItems(2)
      }
    })

    expect(wrapper.classes()).toContain('fl-radial-menu--large')
    expect(wrapper.classes()).not.toContain('fl-radial-menu--medium')
    expect(wrapper.classes()).not.toContain('fl-radial-menu--small')
    expect(wrapper.attributes('style')).not.toContain('--fl-radial-menu-radius')
    expect(wrapper.attributes('style')).not.toContain('--fl-radial-menu-center-size')
    expect(wrapper.attributes('style')).not.toContain('--fl-radial-menu-item-size')
    expect(wrapper.attributes('style')).not.toContain('--fl-radial-menu-item-half-size')

    await wrapper.setProps({ size: 'medium' })

    expect(wrapper.classes()).toContain('fl-radial-menu--medium')
    expect(wrapper.classes()).not.toContain('fl-radial-menu--large')
    expect(wrapper.classes()).not.toContain('fl-radial-menu--small')
    expect(wrapper.attributes('style')).not.toContain('--fl-radial-menu-radius')
    expect(wrapper.attributes('style')).not.toContain('--fl-radial-menu-center-size')
    expect(wrapper.attributes('style')).not.toContain('--fl-radial-menu-item-size')
    expect(wrapper.attributes('style')).not.toContain('--fl-radial-menu-item-half-size')

    await wrapper.setProps({ size: 'small' })

    expect(wrapper.classes()).toContain('fl-radial-menu--small')
    expect(wrapper.classes()).not.toContain('fl-radial-menu--large')
    expect(wrapper.classes()).not.toContain('fl-radial-menu--medium')
    expect(wrapper.attributes('style')).not.toContain('--fl-radial-menu-radius')
    expect(wrapper.attributes('style')).not.toContain('--fl-radial-menu-center-size')
    expect(wrapper.attributes('style')).not.toContain('--fl-radial-menu-item-size')
    expect(wrapper.attributes('style')).not.toContain('--fl-radial-menu-item-half-size')
  })

  it('validates size values and does not expose numeric geometry props', () => {
    const radialMenuProps = flRadialMenuProps as typeof flRadialMenuProps & {
      size?: RadialMenuSizeProp
      radius?: unknown
      centerSize?: unknown
      itemSize?: unknown
    }

    expect(radialMenuProps.size?.default).toBeUndefined()
    expect(radialMenuProps.size?.validator?.('large')).toBe(true)
    expect(radialMenuProps.size?.validator?.('medium')).toBe(true)
    expect(radialMenuProps.size?.validator?.('small')).toBe(true)
    expect(radialMenuProps.size?.validator?.('default')).toBe(false)
    expect(radialMenuProps.size?.validator?.('mini')).toBe(false)
    expect(radialMenuProps.radius).toBeUndefined()
    expect(radialMenuProps.centerSize).toBeUndefined()
    expect(radialMenuProps.itemSize).toBeUndefined()
  })

  it('uses square item type by default and supports circle item type', async () => {
    const wrapper = mount(RadialMenu, {
      props: {
        items: createItems(2)
      }
    })

    expect(wrapper.classes()).toContain('fl-radial-menu--item-square')

    await wrapper.setProps({ itemType: 'circle' })

    expect(wrapper.classes()).toContain('fl-radial-menu--item-circle')
    expect(wrapper.classes()).not.toContain('fl-radial-menu--item-square')
  })

  it('validates item type values', () => {
    const itemTypeProp = (
      flRadialMenuProps as typeof flRadialMenuProps & {
        itemType?: RadialMenuItemTypeProp
      }
    ).itemType

    expect(itemTypeProp?.default).toBe('square')
    expect(itemTypeProp?.validator?.('square')).toBe(true)
    expect(itemTypeProp?.validator?.('circle')).toBe(true)
    expect(itemTypeProp?.validator?.('rounded')).toBe(false)
  })
})

describe('FlRadialMenu item child API and index semantics', () => {
  const PropIcon = () => h('span', { class: 'prop-icon' }, 'prop icon')
  const SlotIcon = () => h('span', { class: 'slot-icon' }, 'slot icon')

  it('renders FlRadialMenuItem children as ring items in slot order', () => {
    const wrapper = mount(RadialMenu, {
      props: {
        modelValue: true
      },
      slots: {
        default: () => [
          h(RadialMenuItemComponent, { index: 'copy', label: 'Copy' }),
          h(RadialMenuItemComponent, { index: 'paste', label: 'Paste' })
        ]
      }
    })

    expect(wrapper.findAll('[role="menuitem"]')).toHaveLength(2)
    expect(wrapper.get('[data-radial-menu-index="copy"]').text()).toContain('Copy')
    expect(wrapper.get('[data-radial-menu-index="paste"]').text()).toContain('Paste')
  })

  it('renders icon slot before the icon prop on child items', () => {
    const wrapper = mount(RadialMenu, {
      props: {
        modelValue: true
      },
      slots: {
        default: () =>
          h(
            RadialMenuItemComponent,
            { index: 'brush', label: 'Brush', icon: PropIcon },
            {
              icon: () => h(SlotIcon)
            }
          )
      }
    })

    expect(wrapper.find('.slot-icon').exists()).toBe(true)
    expect(wrapper.find('.prop-icon').exists()).toBe(false)
  })

  it('renders the label slot before the label prop on child items', () => {
    const wrapper = mount(RadialMenu, {
      props: {
        modelValue: true
      },
      slots: {
        default: () =>
          h(
            RadialMenuItemComponent,
            { index: 'brush', label: 'Brush prop' },
            {
              label: () => h('span', { class: 'slot-label' }, 'Brush slot')
            }
          )
      }
    })

    const label = wrapper.get('[data-radial-menu-index="brush"] .fl-radial-menu__item-label')

    expect(label.find('.slot-label').exists()).toBe(true)
    expect(label.text()).toBe('Brush slot')
    expect(label.text()).not.toContain('Brush prop')
  })

  it('falls back to the label prop when child items have no label slot', () => {
    const wrapper = mount(RadialMenu, {
      props: {
        modelValue: true
      },
      slots: {
        default: () => h(RadialMenuItemComponent, { index: 'text', label: 'Text prop' })
      }
    })

    expect(wrapper.get('[data-radial-menu-index="text"] .fl-radial-menu__item-label').text()).toBe(
      'Text prop'
    )
  })

  it('renders the same label slot in the More dropdown and keeps aria labels stable', async () => {
    const wrapper = mount(RadialMenu, {
      props: {
        modelValue: true
      },
      slots: {
        default: () =>
          Array.from({ length: 7 }, (_, index) =>
            h(
              RadialMenuItemComponent,
              { index: `item-${index + 1}`, label: `Item ${index + 1}` },
              {
                label: () => h('span', { class: `slot-label-${index + 1}` }, `Slot ${index + 1}`)
              }
            )
          )
      }
    })

    expect(wrapper.get('[data-radial-menu-index="item-1"]').attributes('aria-label')).toBe('Item 1')

    await wrapper.get('.fl-radial-menu__more').trigger('click')

    const moreItem = wrapper.get('[data-radial-menu-more-index="item-7"]')
    expect(moreItem.attributes('aria-label')).toBe('Item 7')
    expect(moreItem.get('.fl-radial-menu__more-label .slot-label-7').text()).toBe('Slot 7')
  })

  it('keeps the prop label in select payload when rendering a label slot', async () => {
    const wrapper = mount(RadialMenu, {
      props: {
        modelValue: true
      },
      slots: {
        default: () =>
          h(
            RadialMenuItemComponent,
            { index: 'rename', label: 'Rename prop' },
            {
              label: () => h('span', { class: 'slot-label' }, 'Rename slot')
            }
          )
      }
    })

    await wrapper.get('[data-radial-menu-index="rename"]').trigger('click')

    expect(wrapper.emitted('select')?.[0]).toEqual([
      'rename',
      ['rename'],
      expect.objectContaining({ index: 'rename', label: 'Rename prop' }),
      expect.objectContaining({ source: 'ring', index: 0 })
    ])
  })

  it('emits select with Element Plus Menu style index and indexPath', async () => {
    const wrapper = mount(RadialMenu, {
      props: {
        modelValue: true
      },
      slots: {
        default: () => h(RadialMenuItemComponent, { index: 'delete', label: 'Delete' })
      }
    })

    await wrapper.get('[data-radial-menu-index="delete"]').trigger('click')

    expect(wrapper.emitted('select')?.[0]).toEqual([
      'delete',
      ['delete'],
      expect.objectContaining({ index: 'delete', label: 'Delete' }),
      expect.objectContaining({ source: 'ring', index: 0 })
    ])
  })

  it('uses the item index instead of the Vue vnode key for menu selection', async () => {
    const wrapper = mount(RadialMenu, {
      props: {
        modelValue: true
      },
      slots: {
        default: () =>
          h(RadialMenuItemComponent, { key: 'vue-diff-key', index: 'menu-index', label: 'Copy' })
      }
    })

    await wrapper.get('[data-radial-menu-index="menu-index"]').trigger('click')

    expect(wrapper.emitted('select')?.[0]?.[0]).toBe('menu-index')
    expect(wrapper.emitted('select')?.[0]?.[0]).not.toBe('vue-diff-key')
  })

  it('keeps legacy items prop key as a compatibility fallback', async () => {
    const wrapper = mount(RadialMenu, {
      props: {
        items: [{ key: 'legacy-key', label: 'Legacy' }],
        modelValue: true
      }
    })

    await wrapper.get('[data-radial-menu-index="legacy-key"]').trigger('click')

    expect(wrapper.emitted('select')?.[0]?.[0]).toBe('legacy-key')
    expect(wrapper.emitted('select')?.[0]?.[1]).toEqual(['legacy-key'])
  })

  it('warns and skips slot items with missing or duplicate indexes', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    const wrapper = mount(RadialMenu, {
      props: {
        modelValue: true
      },
      slots: {
        default: () => [
          h(RadialMenuItemComponent, { label: 'Missing' }),
          h(RadialMenuItemComponent, { index: 'same', label: 'First' }),
          h(RadialMenuItemComponent, { index: 'same', label: 'Second' })
        ]
      }
    })

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Missing required prop: "index"'))
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Duplicate item index detected: same')
    )
    expect(wrapper.findAll('[role="menuitem"]')).toHaveLength(1)

    warn.mockRestore()
  })
})

describe('FlRadialMenu entry animation', () => {
  it('animates ring items from the left side along the clockwise track on click open', async () => {
    stubReducedMotion(false)
    const { animateCalls, animateMock } = mockElementAnimate()
    const wrapper = mount(RadialMenu, {
      props: {
        items: createItems(4)
      }
    })

    await wrapper.get('.fl-radial-menu__center').trigger('click')
    await flushRadialMenuEntry()

    expect(animateMock).toHaveBeenCalledTimes(4)

    const firstItemCall = animateCalls.find(
      ({ element }) => element.dataset.radialMenuIndex === 'item-1'
    )
    const keyframes = firstItemCall?.keyframes as Keyframe[]

    expect(keyframes[0].transform).toContain('-96px')
    expect(keyframes[0].transform).toContain('0px')
    expect(keyframes.at(-1)?.transform).toContain('-96px')
  })

  it('stagger-delays ring items by farthest clockwise distance from the left side first', async () => {
    stubReducedMotion(false)
    const { animateCalls } = mockElementAnimate()
    const wrapper = mount(RadialMenu, {
      props: {
        items: createItems(4)
      }
    })

    await wrapper.get('.fl-radial-menu__center').trigger('click')
    await flushRadialMenuEntry()

    const delayByIndex = new Map(
      animateCalls.map(({ element, options }) => [
        element.dataset.radialMenuIndex,
        options.delay ?? 0
      ])
    )

    expect(delayByIndex.get('item-3')).toBe(120)
    expect(delayByIndex.get('item-2')).toBe(210)
    expect(delayByIndex.get('item-1')).toBe(300)
    expect(delayByIndex.get('item-4')).toBe(390)
    expect(delayByIndex.get('item-3')).toBeLessThan(delayByIndex.get('item-2') ?? 0)
    expect(delayByIndex.get('item-2')).toBeLessThan(delayByIndex.get('item-1') ?? 0)
    expect(delayByIndex.get('item-1')).toBeLessThan(delayByIndex.get('item-4') ?? 0)
  })

  it('uses longer entry durations for farther clockwise travel distances', async () => {
    stubReducedMotion(false)
    const { animateCalls } = mockElementAnimate()
    const wrapper = mount(RadialMenu, {
      props: {
        items: createItems(4)
      }
    })

    await wrapper.get('.fl-radial-menu__center').trigger('click')
    await flushRadialMenuEntry()

    const durationByIndex = new Map(
      animateCalls.map(({ element, options }) => [
        element.dataset.radialMenuIndex,
        options.duration ?? 0
      ])
    )

    expect(durationByIndex.get('item-3')).toBe(560)
    expect(durationByIndex.get('item-2')).toBe(520)
    expect(durationByIndex.get('item-1')).toBe(480)
    expect(durationByIndex.get('item-4')).toBe(440)
    expect(durationByIndex.get('item-3')).toBeGreaterThan(durationByIndex.get('item-2') ?? 0)
    expect(durationByIndex.get('item-2')).toBeGreaterThan(durationByIndex.get('item-1') ?? 0)
    expect(durationByIndex.get('item-1')).toBeGreaterThan(durationByIndex.get('item-4') ?? 0)
  })

  it('uses the same entry animation when opened by hover and controlled modelValue', async () => {
    stubReducedMotion(false)
    const { animateMock } = mockElementAnimate()
    const hoverWrapper = mount(RadialMenu, {
      props: {
        items: createItems(2),
        trigger: 'hover'
      }
    })

    await hoverWrapper.trigger('mouseenter')
    await flushRadialMenuEntry()

    expect(animateMock).toHaveBeenCalledTimes(2)

    const controlledWrapper = mount(RadialMenu, {
      props: {
        items: createItems(2),
        modelValue: false
      }
    })

    await controlledWrapper.setProps({ modelValue: true })
    await flushRadialMenuEntry()

    expect(animateMock).toHaveBeenCalledTimes(4)
  })

  it('skips WAAPI entry animation when reduced motion is preferred', async () => {
    stubReducedMotion(true)
    const { animateMock } = mockElementAnimate()
    const wrapper = mount(RadialMenu, {
      props: {
        items: createItems(3)
      }
    })

    await wrapper.get('.fl-radial-menu__center').trigger('click')
    await flushRadialMenuEntry()

    expect(wrapper.findAll('[role="menuitem"]')).toHaveLength(3)
    expect(animateMock).not.toHaveBeenCalled()
  })
})

describe('FlRadialMenu styles and active sector', () => {
  it('uses Falcon BEM helpers in Vue and SCSS sources', () => {
    const vueSource = readProjectFile('packages/components/radial-menu/src/radial-menu.vue')
    const scssSource = readProjectFile('packages/theme/src/radial-menu.scss')

    expect(vueSource).toContain("useNamespace('radial-menu')")
    expect(scssSource).toContain('@include bem.b(radial-menu)')
    expect(scssSource).toContain('@include bem.e(center)')
    expect(scssSource).toContain('@include bem.e(item)')
    expect(scssSource).not.toContain('.fl-radial-menu__item')
  })

  it('uses one border width token for the track, center, and ring items', () => {
    const scssSource = readProjectFile('packages/theme/src/radial-menu.scss')

    expect(scssSource).toContain('--fl-radial-menu-border-width: 2px')
    expect(scssSource).toContain(
      'border: var(--fl-radial-menu-border-width) solid var(--fl-radial-menu-primary-color)'
    )
    expect(scssSource).toContain(
      'border: var(--fl-radial-menu-border-width) solid var(--el-border-color-light)'
    )
    expect(scssSource.match(/stroke-width: var\(--fl-radial-menu-border-width\)/g)).toHaveLength(2)
  })

  it('defines entry animation hooks for track, ring items, More trigger, and reduced motion', () => {
    const scssSource = readProjectFile('packages/theme/src/radial-menu.scss')

    expect(scssSource).toContain('@keyframes fl-radial-menu-track-fade-in')
    expect(scssSource).toContain('animation: fl-radial-menu-track-fade-in')
    expect(scssSource).toContain('--fl-radial-menu-more-enter-delay')
    expect(scssSource).toContain('@include bem.when(entering)')
    expect(scssSource).toContain('translate(calc(-50% - var(--fl-radial-menu-radius)), -50%)')
    expect(scssSource).toContain('will-change: transform, opacity')
    expect(scssSource).toContain('@media (prefers-reduced-motion: reduce)')
    expect(scssSource).toContain('animation: none')
  })

  it('defines all size variables in SCSS size modifiers', () => {
    const scssSource = readProjectFile('packages/theme/src/radial-menu.scss')

    expect(scssSource).toContain('@include bem.m(large)')
    expect(scssSource).toContain('@include bem.m(medium)')
    expect(scssSource).toContain('@include bem.m(small)')
    expect(scssSource).not.toContain('@include bem.m($size)')
    expect(scssSource).not.toContain('.fl-radial-menu--large')
    expect(scssSource).not.toContain('.fl-radial-menu--medium')
    expect(scssSource).not.toContain('.fl-radial-menu--small')
  })

  it('keeps item tip labels single-line with content-driven height', () => {
    const scssSource = readProjectFile('packages/theme/src/radial-menu.scss')
    const labelBlock =
      scssSource.match(/@include bem\.e\(item-label\) \{[\s\S]*?\n {2}\}/)?.[0] ?? ''

    expect(scssSource).not.toContain('max-width: 120px')
    expect(labelBlock).toContain('width: max-content')
    expect(labelBlock).not.toMatch(/\n\s+height:/)
    expect(labelBlock).toContain('padding: 6px 10px')
    expect(labelBlock).toContain('font-size: 12px')
    expect(labelBlock).toContain('line-height: 1')
    expect(labelBlock).toContain('display: inline-flex')
    expect(labelBlock).toContain('align-items: center')
    expect(labelBlock).toContain('white-space: nowrap')
    expect(labelBlock.match(/calc\(100% \+ 10px\)/g) ?? []).toHaveLength(4)
    expect(labelBlock).not.toContain('calc(100% + 8px)')
  })

  it('keeps the More trigger label on one line without fixed width', () => {
    const scssSource = readProjectFile('packages/theme/src/radial-menu.scss')
    const moreBlock = scssSource.match(/@include bem\.e\(more\) \{[\s\S]*?\n {2}\}/)?.[0] ?? ''

    expect(moreBlock).toContain('display: inline-flex')
    expect(moreBlock).toContain('align-items: center')
    expect(moreBlock).toContain('justify-content: center')
    expect(moreBlock).toContain('white-space: nowrap')
    expect(moreBlock).not.toMatch(/\n\s+width:/)
    expect(moreBlock).toMatch(
      /top:\s*calc\(\s*50% \+ var\(--fl-radial-menu-radius\) \+ var\(--fl-radial-menu-item-half-size\) \+ 10px\s*\)/
    )
    expect(moreBlock).not.toContain('+ 18px')
  })

  it('keeps the More dropdown below the More trigger after spacing it from ring items', () => {
    const scssSource = readProjectFile('packages/theme/src/radial-menu.scss')
    const dropdownBlock =
      scssSource.match(/@include bem\.e\(more-dropdown\) \{[\s\S]*?\n {2}\}/)?.[0] ?? ''

    expect(dropdownBlock).toMatch(
      /top:\s*calc\(\s*50% \+ var\(--fl-radial-menu-radius\) \+ var\(--fl-radial-menu-item-half-size\) \+ 46px\s*\)/
    )
    expect(dropdownBlock).not.toContain('+ 54px')
  })

  it('hides item tip labels that would overlap the More trigger', () => {
    const scssSource = readProjectFile('packages/theme/src/radial-menu.scss')

    expect(scssSource).toContain('@include bem.m(hidden-by-more)')
    expect(scssSource).toContain('opacity: 0')
    expect(scssSource).toContain('pointer-events: none')
  })

  it('sets active item and sector on hover', async () => {
    const wrapper = mount(RadialMenu, {
      props: {
        items: createItems(3),
        modelValue: true
      }
    })

    await wrapper.find('[data-radial-menu-index="item-2"]').trigger('mouseenter')

    expect(wrapper.find('[data-radial-menu-index="item-2"]').classes()).toContain('is-active')
    expect(wrapper.find('.fl-radial-menu__sector-path').exists()).toBe(true)
    expect(wrapper.find('.fl-radial-menu__track-active').exists()).toBe(true)
    expect(wrapper.emitted('active-change')?.[0]?.[0]).toMatchObject({ index: 'item-2' })
  })

  it('keeps the active sector inside the track radius', async () => {
    const wrapper = mount(RadialMenu, {
      props: {
        items: createItems(3),
        modelValue: true
      }
    })

    await wrapper.find('[data-radial-menu-index="item-1"]').trigger('mouseenter')

    expect(wrapper.find('.fl-radial-menu__sector-path').attributes('d')).toContain('A 96 96')
  })

  it('uses selected size geometry for active sector paths', async () => {
    const sizeCases = [
      { size: 'medium', radius: 80, innerRadius: 32 },
      { size: 'small', radius: 64, innerRadius: 28 }
    ] as const

    for (const { size, radius, innerRadius } of sizeCases) {
      const wrapper = mount(RadialMenu, {
        props: {
          items: createItems(3),
          modelValue: true,
          size
        }
      })

      await wrapper.find('[data-radial-menu-index="item-1"]').trigger('mouseenter')

      expect(wrapper.find('.fl-radial-menu__sector-path').attributes('d')).toContain(
        `A ${radius} ${radius}`
      )
      expect(wrapper.find('.fl-radial-menu__track-active').attributes('d')).toBe(
        getTrackArcPathHelper()?.({
          activeIndex: 0,
          count: 3,
          radius,
          innerRadius
        })
      )
    }
  })

  it('uses Element Plus global size when size prop is omitted', async () => {
    const wrapper = mountWithGlobalSize('small')
    const radialMenu = wrapper.getComponent(RadialMenu)

    expect(radialMenu.classes()).toContain('fl-radial-menu--small')

    await radialMenu.find('[data-radial-menu-index="item-1"]').trigger('mouseenter')

    expect(radialMenu.find('.fl-radial-menu__sector-path').attributes('d')).toContain('A 64 64')
  })

  it('maps Element Plus default global size to medium', async () => {
    const wrapper = mountWithGlobalSize('default')
    const radialMenu = wrapper.getComponent(RadialMenu)

    expect(radialMenu.classes()).toContain('fl-radial-menu--medium')

    await radialMenu.find('[data-radial-menu-index="item-1"]').trigger('mouseenter')

    expect(radialMenu.find('.fl-radial-menu__sector-path').attributes('d')).toContain('A 80 80')
  })

  it('lets explicit size prop override Element Plus global size', async () => {
    const wrapper = mountWithGlobalSize('large', { size: 'small' })
    const radialMenu = wrapper.getComponent(RadialMenu)

    expect(radialMenu.classes()).toContain('fl-radial-menu--small')
    expect(radialMenu.classes()).not.toContain('fl-radial-menu--large')

    await radialMenu.find('[data-radial-menu-index="item-1"]').trigger('mouseenter')

    expect(radialMenu.find('.fl-radial-menu__sector-path').attributes('d')).toContain('A 64 64')
  })

  it('renders the base track while opened', () => {
    const wrapper = mount(RadialMenu, {
      props: {
        items: createItems(3),
        modelValue: true
      }
    })

    expect(wrapper.find('.fl-radial-menu__track').exists()).toBe(true)
  })

  it('uses the active sector angle for the highlighted track arc', async () => {
    const getRadialMenuTrackArcPath = getTrackArcPathHelper()
    const wrapper = mount(RadialMenu, {
      props: {
        items: createItems(3),
        modelValue: true
      }
    })

    await wrapper.find('[data-radial-menu-index="item-2"]').trigger('mouseenter')

    expect(getRadialMenuTrackArcPath).toBeTypeOf('function')
    expect(wrapper.find('.fl-radial-menu__track-active').attributes('d')).toBe(
      getRadialMenuTrackArcPath?.({
        activeIndex: 1,
        count: 3,
        radius: 96,
        innerRadius: 36
      })
    )
  })

  it('places item tips outward by their dominant ring direction', () => {
    const wrapper = mount(RadialMenu, {
      props: {
        items: createItems(4),
        modelValue: true
      }
    })

    expect(
      wrapper.get('[data-radial-menu-index="item-1"] .fl-radial-menu__item-label').classes()
    ).toContain('fl-radial-menu__item-label--tip-top')
    expect(
      wrapper.get('[data-radial-menu-index="item-2"] .fl-radial-menu__item-label').classes()
    ).toContain('fl-radial-menu__item-label--tip-right')
    expect(
      wrapper.get('[data-radial-menu-index="item-3"] .fl-radial-menu__item-label').classes()
    ).toContain('fl-radial-menu__item-label--tip-bottom')
    expect(
      wrapper.get('[data-radial-menu-index="item-4"] .fl-radial-menu__item-label').classes()
    ).toContain('fl-radial-menu__item-label--tip-left')
  })

  it('hides the bottom item tip when overflow items create the More trigger', () => {
    const wrapper = mount(RadialMenu, {
      props: {
        items: createItems(8),
        modelValue: true
      }
    })

    const bottomLabel = wrapper.get('[data-radial-menu-index="item-4"] .fl-radial-menu__item-label')
    const topLabel = wrapper.get('[data-radial-menu-index="item-1"] .fl-radial-menu__item-label')

    expect(bottomLabel.classes()).toContain('fl-radial-menu__item-label--tip-bottom')
    expect(bottomLabel.classes()).toContain('fl-radial-menu__item-label--hidden-by-more')
    expect(topLabel.classes()).not.toContain('fl-radial-menu__item-label--hidden-by-more')
  })

  it('keeps the bottom item tip visible when there is no More trigger', () => {
    const wrapper = mount(RadialMenu, {
      props: {
        items: createItems(4),
        modelValue: true
      }
    })

    const bottomLabel = wrapper.get('[data-radial-menu-index="item-3"] .fl-radial-menu__item-label')

    expect(bottomLabel.classes()).toContain('fl-radial-menu__item-label--tip-bottom')
    expect(bottomLabel.classes()).not.toContain('fl-radial-menu__item-label--hidden-by-more')
  })
})

describe('FlRadialMenu More dropdown and select', () => {
  it('renders overflow items in the More dropdown', async () => {
    const wrapper = mount(RadialMenu, {
      props: {
        items: createItems(8),
        modelValue: true
      }
    })

    expect(wrapper.findAll('.fl-radial-menu__item')).toHaveLength(6)
    expect(wrapper.get('.fl-radial-menu__more').text()).toContain('More')

    await wrapper.get('.fl-radial-menu__more').trigger('click')

    expect(wrapper.findAll('.fl-radial-menu__more-item')).toHaveLength(2)
  })

  it('renders overflow item icons in the More dropdown', async () => {
    const IconComponent = markRaw({
      name: 'OverflowItemIcon',
      render: () => h('svg', { class: 'overflow-item-icon' })
    })
    const wrapper = mount(RadialMenu, {
      props: {
        items: createItems(8).map((item) => ({ ...item, icon: IconComponent })),
        modelValue: true
      }
    })

    await wrapper.get('.fl-radial-menu__more').trigger('click')

    expect(wrapper.findAll('.fl-radial-menu__more-icon')).toHaveLength(2)
    expect(wrapper.findAll('.overflow-item-icon')).toHaveLength(8)
  })

  it('emits select and closes after choosing a ring item', async () => {
    const wrapper = mount(RadialMenu, {
      props: {
        items: createItems(2),
        modelValue: true
      }
    })

    await wrapper.get('[data-radial-menu-index="item-1"]').trigger('click')

    expect(wrapper.emitted('select')?.[0]).toEqual([
      'item-1',
      ['item-1'],
      expect.objectContaining({ index: 'item-1' }),
      expect.objectContaining({ source: 'ring', index: 0 })
    ])
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
  })

  it('keeps open when closeOnSelect is false', async () => {
    const wrapper = mount(RadialMenu, {
      props: {
        items: createItems(2),
        modelValue: true,
        closeOnSelect: false
      }
    })

    await wrapper.get('[data-radial-menu-index="item-1"]').trigger('click')

    expect(wrapper.emitted('select')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('closes an uncontrolled menu after clicking outside', async () => {
    const wrapper = mount(RadialMenu, {
      attachTo: document.body,
      props: {
        items: createItems(2)
      }
    })

    await wrapper.get('.fl-radial-menu__center').trigger('click')
    expect(wrapper.findAll('[role="menuitem"]')).toHaveLength(2)

    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await nextTick()

    expect(wrapper.findAll('[role="menuitem"]')).toHaveLength(0)
    wrapper.unmount()
  })

  it('keeps the menu open when pointerdown happens inside More content', async () => {
    const wrapper = mount(RadialMenu, {
      attachTo: document.body,
      props: {
        items: createItems(8)
      }
    })

    await wrapper.get('.fl-radial-menu__center').trigger('click')
    await wrapper.get('.fl-radial-menu__more').trigger('click')
    expect(wrapper.findAll('.fl-radial-menu__more-item')).toHaveLength(2)

    wrapper
      .get('[data-radial-menu-more-index="item-7"]')
      .element.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await nextTick()

    expect(wrapper.findAll('[role="menuitem"]')).toHaveLength(8)
    expect(wrapper.findAll('.fl-radial-menu__more-item')).toHaveLength(2)
    wrapper.unmount()
  })

  it('emits model updates when clicking outside a controlled menu', async () => {
    const wrapper = mount(RadialMenu, {
      attachTo: document.body,
      props: {
        items: createItems(2),
        modelValue: true
      }
    })

    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
    wrapper.unmount()
  })

  it('emits model updates when clicking outside a manually triggered controlled menu', async () => {
    const wrapper = mount(RadialMenu, {
      attachTo: document.body,
      props: {
        items: createItems(2),
        modelValue: true,
        trigger: 'manual'
      }
    })

    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
    wrapper.unmount()
  })
})

describe('FlRadialMenu keyboard accessibility', () => {
  it('moves focus with arrow keys and skips disabled items', async () => {
    const wrapper = mount(RadialMenu, {
      attachTo: document.body,
      props: {
        items: [
          { index: 'a', label: 'A' },
          { index: 'b', label: 'B', disabled: true },
          { index: 'c', label: 'C' }
        ],
        modelValue: true
      }
    })

    const first = wrapper.get('[data-radial-menu-index="a"]')
    await first.trigger('focus')
    await first.trigger('keydown', { key: 'ArrowRight' })

    expect(document.activeElement).toBe(wrapper.get('[data-radial-menu-index="c"]').element)
    wrapper.unmount()
  })

  it('activates the focused item with Enter', async () => {
    const wrapper = mount(RadialMenu, {
      attachTo: document.body,
      props: {
        items: createItems(2),
        modelValue: true
      }
    })

    const first = wrapper.get('[data-radial-menu-index="item-1"]')
    await first.trigger('focus')
    await first.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('select')?.[0]).toEqual([
      'item-1',
      ['item-1'],
      expect.objectContaining({ index: 'item-1' }),
      expect.objectContaining({ source: 'ring', index: 0 })
    ])
    wrapper.unmount()
  })

  it('closes on Escape', async () => {
    const wrapper = mount(RadialMenu, {
      attachTo: document.body,
      props: {
        items: createItems(2),
        modelValue: true
      }
    })

    await wrapper.get('[role="menu"]').trigger('keydown', { key: 'Escape' })

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
    wrapper.unmount()
  })
})

describe('FlRadialMenu floating shortcut', () => {
  it('opens in floating mode from shortcut using last mouse position', async () => {
    const wrapper = mount(RadialMenu, {
      attachTo: document.body,
      props: {
        items: createItems(2),
        mode: 'floating',
        shortcut: 'Alt+W'
      }
    })

    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 320, clientY: 180 }))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w', altKey: true }))
    await wrapper.vm.$nextTick()

    expect(wrapper.classes()).toContain('fl-radial-menu--floating')
    expect(wrapper.attributes('style')).toContain('--fl-radial-menu-floating-x: 320px')
    expect(wrapper.attributes('style')).toContain('--fl-radial-menu-floating-y: 180px')
    expect(wrapper.findAll('[role="menuitem"]')).toHaveLength(2)
    wrapper.unmount()
  })

  it('does not trigger shortcut from editable targets', async () => {
    const wrapper = mount(RadialMenu, {
      attachTo: document.body,
      props: {
        items: createItems(2),
        mode: 'floating',
        shortcut: 'Alt+W'
      }
    })
    const input = document.createElement('input')
    document.body.appendChild(input)

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'w', altKey: true, bubbles: true }))
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('[role="menuitem"]')).toHaveLength(0)
    input.remove()
    wrapper.unmount()
  })
})

describe('FlRadialMenu docs examples', () => {
  it('reserves a centered stage large enough for expanded radial menus', () => {
    const demoFiles = [
      'basic.vue',
      'controlled.vue',
      'custom-center.vue',
      'floating-shortcut.vue',
      'item-type.vue',
      'more.vue',
      'size.vue'
    ]
    const customCss = readProjectFile('docs/.vitepress/styles/custom.css')

    for (const file of demoFiles) {
      expect(readProjectFile(`docs/examples/radial-menu/${file}`)).toContain(
        'radial-menu-demo-stage'
      )
    }

    expect(customCss).toContain('.radial-menu-demo-stage')
    expect(customCss).toContain('min-height: 340px')
    expect(customCss).toContain('place-items: center')
  })

  it('anchors the floating shortcut example inside its demo stage', () => {
    const source = readProjectFile('docs/examples/radial-menu/floating-shortcut.vue')

    expect(source).toContain(':deep(.fl-radial-menu--floating)')
    expect(source).toContain('position: relative')
    expect(source).toContain('top: auto')
    expect(source).toContain('left: auto')
    expect(source).toContain('transform: none')
  })

  it('documents the circle item type without changing the basic example default', () => {
    const docsSource = readProjectFile('docs/components/radial-menu.md')
    const basicSource = readProjectFile('docs/examples/radial-menu/basic.vue')
    const itemTypeSource = readProjectFile('docs/examples/radial-menu/item-type.vue')

    expect(docsSource).toContain('radial-menu/item-type')
    expect(basicSource).not.toContain('item-type=')
    expect(itemTypeSource).toContain('item-type="circle"')
  })

  it('documents explicit radial menu sizes without exposing default as a prop value', () => {
    const docsSource = readProjectFile('docs/components/radial-menu.md')
    const sizeSource = readProjectFile('docs/examples/radial-menu/size.vue')

    expect(docsSource).toContain('radial-menu/size')
    expect(sizeSource).toContain('size="large"')
    expect(sizeSource).toContain('size="medium"')
    expect(sizeSource).toContain('size="small"')
    expect(sizeSource).not.toContain('size="default"')
    expect(sizeSource).toContain('column-gap: 200px')
    expect(sizeSource).toContain('row-gap: 220px')
  })
})
