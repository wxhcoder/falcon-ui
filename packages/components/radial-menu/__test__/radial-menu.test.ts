import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import RadialMenu from '../src/radial-menu.vue'
import { splitRadialMenuItems } from '../src/use-radial-menu-items'
import { getRadialMenuItemLayout, getRadialMenuSectorPath } from '../src/use-radial-menu-position'
import type { FlRadialMenuItem } from '../src/types'

const createItems = (count: number): FlRadialMenuItem[] =>
  Array.from({ length: count }, (_, index) => ({
    key: `item-${index + 1}`,
    label: `Item ${index + 1}`
  }))

const readProjectFile = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), 'utf8')

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
    expect(wrapper.emitted('active-change')?.[0]?.[0]).toMatchObject({ key: 'item-2' })
  })
})
