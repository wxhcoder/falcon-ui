import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import RadialMenu from '../src/radial-menu.vue'
import { flRadialMenuProps } from '../src/radial-menu'
import { splitRadialMenuItems } from '../src/use-radial-menu-items'
import * as radialMenuPosition from '../src/use-radial-menu-position'
import { getRadialMenuItemLayout, getRadialMenuSectorPath } from '../src/use-radial-menu-position'
import type { FlRadialMenuItem } from '../src/types'

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

const createItems = (count: number): FlRadialMenuItem[] =>
  Array.from({ length: count }, (_, index) => ({
    key: `item-${index + 1}`,
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

const getOuterArcSignature = (path: string, radius: number) => {
  const match = path.match(
    new RegExp(`^M ([^ ]+) ([^ ]+) A ${radius} ${radius} 0 ([01]) 1 ([^ ]+) ([^ ]+)`)
  )

  return match?.slice(1)
}

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
    expect(wrapper.find('[data-radial-menu-key="item-1"]').attributes('style')).toContain(
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

  it('uses large size by default and supports medium and small presets', async () => {
    const wrapper = mount(RadialMenu, {
      props: {
        items: createItems(2)
      }
    })

    expect(wrapper.classes()).toContain('fl-radial-menu--large')
    expect(wrapper.attributes('style')).toContain('--fl-radial-menu-radius: 96px')
    expect(wrapper.attributes('style')).toContain('--fl-radial-menu-center-size: 56px')
    expect(wrapper.attributes('style')).toContain('--fl-radial-menu-item-size: 44px')

    await wrapper.setProps({ size: 'medium' })

    expect(wrapper.classes()).toContain('fl-radial-menu--medium')
    expect(wrapper.attributes('style')).toContain('--fl-radial-menu-radius: 80px')
    expect(wrapper.attributes('style')).toContain('--fl-radial-menu-center-size: 48px')
    expect(wrapper.attributes('style')).toContain('--fl-radial-menu-item-size: 36px')

    await wrapper.setProps({ size: 'small' })

    expect(wrapper.classes()).toContain('fl-radial-menu--small')
    expect(wrapper.attributes('style')).toContain('--fl-radial-menu-radius: 64px')
    expect(wrapper.attributes('style')).toContain('--fl-radial-menu-center-size: 40px')
    expect(wrapper.attributes('style')).toContain('--fl-radial-menu-item-size: 32px')
  })

  it('lets numeric geometry props override the selected size preset', () => {
    const wrapper = mount(RadialMenu, {
      props: {
        items: createItems(2),
        size: 'small',
        radius: 120,
        centerSize: 58,
        itemSize: 46
      }
    })

    expect(wrapper.attributes('style')).toContain('--fl-radial-menu-radius: 120px')
    expect(wrapper.attributes('style')).toContain('--fl-radial-menu-center-size: 58px')
    expect(wrapper.attributes('style')).toContain('--fl-radial-menu-item-size: 46px')
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

  it('keeps item tip labels single-line and aligned with the default Element Plus tag sizing', () => {
    const scssSource = readProjectFile('packages/theme/src/radial-menu.scss')

    expect(scssSource).not.toContain('max-width: 120px')
    expect(scssSource).toContain('width: max-content')
    expect(scssSource).toContain('height: 24px')
    expect(scssSource).toContain('padding: 0 9px')
    expect(scssSource).toContain('font-size: 12px')
    expect(scssSource).toContain('line-height: 1')
    expect(scssSource).toContain('display: inline-flex')
    expect(scssSource).toContain('align-items: center')
    expect(scssSource).toContain('white-space: nowrap')
  })

  it('keeps the More trigger label on one line without fixed width', () => {
    const scssSource = readProjectFile('packages/theme/src/radial-menu.scss')
    const moreBlock = scssSource.match(/@include bem\.e\(more\) \{[\s\S]*?\n {2}\}/)?.[0] ?? ''

    expect(moreBlock).toContain('display: inline-flex')
    expect(moreBlock).toContain('align-items: center')
    expect(moreBlock).toContain('justify-content: center')
    expect(moreBlock).toContain('white-space: nowrap')
    expect(moreBlock).not.toMatch(/\n\s+width:/)
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

    await wrapper.find('[data-radial-menu-key="item-2"]').trigger('mouseenter')

    expect(wrapper.find('[data-radial-menu-key="item-2"]').classes()).toContain('is-active')
    expect(wrapper.find('.fl-radial-menu__sector-path').exists()).toBe(true)
    expect(wrapper.find('.fl-radial-menu__track-active').exists()).toBe(true)
    expect(wrapper.emitted('active-change')?.[0]?.[0]).toMatchObject({ key: 'item-2' })
  })

  it('keeps the active sector inside the track radius', async () => {
    const wrapper = mount(RadialMenu, {
      props: {
        items: createItems(3),
        modelValue: true
      }
    })

    await wrapper.find('[data-radial-menu-key="item-1"]').trigger('mouseenter')

    expect(wrapper.find('.fl-radial-menu__sector-path').attributes('d')).toContain('A 96 96')
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

    await wrapper.find('[data-radial-menu-key="item-2"]').trigger('mouseenter')

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
      wrapper.get('[data-radial-menu-key="item-1"] .fl-radial-menu__item-label').classes()
    ).toContain('fl-radial-menu__item-label--tip-top')
    expect(
      wrapper.get('[data-radial-menu-key="item-2"] .fl-radial-menu__item-label').classes()
    ).toContain('fl-radial-menu__item-label--tip-right')
    expect(
      wrapper.get('[data-radial-menu-key="item-3"] .fl-radial-menu__item-label').classes()
    ).toContain('fl-radial-menu__item-label--tip-bottom')
    expect(
      wrapper.get('[data-radial-menu-key="item-4"] .fl-radial-menu__item-label').classes()
    ).toContain('fl-radial-menu__item-label--tip-left')
  })

  it('hides the bottom item tip when overflow items create the More trigger', () => {
    const wrapper = mount(RadialMenu, {
      props: {
        items: createItems(8),
        modelValue: true
      }
    })

    const bottomLabel = wrapper.get('[data-radial-menu-key="item-4"] .fl-radial-menu__item-label')
    const topLabel = wrapper.get('[data-radial-menu-key="item-1"] .fl-radial-menu__item-label')

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

    const bottomLabel = wrapper.get('[data-radial-menu-key="item-3"] .fl-radial-menu__item-label')

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

  it('emits select and closes after choosing a ring item', async () => {
    const wrapper = mount(RadialMenu, {
      props: {
        items: createItems(2),
        modelValue: true
      }
    })

    await wrapper.get('[data-radial-menu-key="item-1"]').trigger('click')

    expect(wrapper.emitted('select')?.[0]?.[0]).toMatchObject({ key: 'item-1' })
    expect(wrapper.emitted('select')?.[0]?.[1]).toMatchObject({ source: 'ring', index: 0 })
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

    await wrapper.get('[data-radial-menu-key="item-1"]').trigger('click')

    expect(wrapper.emitted('select')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})

describe('FlRadialMenu keyboard accessibility', () => {
  it('moves focus with arrow keys and skips disabled items', async () => {
    const wrapper = mount(RadialMenu, {
      attachTo: document.body,
      props: {
        items: [
          { key: 'a', label: 'A' },
          { key: 'b', label: 'B', disabled: true },
          { key: 'c', label: 'C' }
        ],
        modelValue: true
      }
    })

    const first = wrapper.get('[data-radial-menu-key="a"]')
    await first.trigger('focus')
    await first.trigger('keydown', { key: 'ArrowRight' })

    expect(document.activeElement).toBe(wrapper.get('[data-radial-menu-key="c"]').element)
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

    const first = wrapper.get('[data-radial-menu-key="item-1"]')
    await first.trigger('focus')
    await first.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('select')?.[0]?.[0]).toMatchObject({ key: 'item-1' })
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
      'more.vue'
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
})
