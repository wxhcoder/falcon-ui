import fs from 'node:fs'
import path from 'node:path'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import HomeExplodedIllustration from '../components/HomeExplodedIllustration.vue'

const rootDir = path.resolve(__dirname, '../../..')

const readText = (relativePath: string) =>
  fs.readFileSync(path.resolve(rootDir, relativePath), 'utf8')

const readConnectorGroup = (source: string, connector: 'left' | 'center' | 'right') => {
  const match = source.match(
    new RegExp(`<g class="svg-connector svg-connector--${connector}">([\\s\\S]*?)</g>`)
  )

  expect(match).not.toBeNull()

  return match?.[1] ?? ''
}

const planeWidth = 760
const planeHeight = 220
const planePadding = 10
const planeGap = 10

const expectedPlanes = {
  template: {
    points: [
      [700, 0],
      [1435, 60],
      [1135, 180],
      [400, 120]
    ],
    cards: [
      { x: 10, y: 10, width: 170, height: 200 },
      { x: 190, y: 10, width: 560, height: 200 }
    ]
  },
  components: {
    points: [
      [700, 180],
      [1435, 260],
      [1135, 420],
      [400, 340]
    ],
    cards: [
      { x: 10, y: 10, width: 240, height: 200 },
      { x: 260, y: 10, width: 245, height: 200 },
      { x: 515, y: 10, width: 235, height: 200 }
    ]
  },
  content: {
    points: [
      [700, 360],
      [1435, 460],
      [1135, 660],
      [400, 560]
    ],
    cards: [
      { x: 10, y: 10, width: 365, height: 200 },
      { x: 385, y: 10, width: 365, height: 200 }
    ]
  },
  foundation: {
    points: [
      [700, 530],
      [1435, 660],
      [1135, 920],
      [400, 790]
    ],
    cards: [
      { x: 10, y: 10, width: 240, height: 200 },
      { x: 260, y: 10, width: 245, height: 200 },
      { x: 515, y: 10, width: 235, height: 200 }
    ]
  }
} as const

const parseMatrix = (value: string) => {
  const match = value.match(/^matrix\(([-\d. ]+)\)$/)

  expect(match).not.toBeNull()

  return (match?.[1] ?? '').split(' ').map(Number)
}

const mapPoint = (matrix: number[], x: number, y: number) => {
  const [a, b, c, d, e, f] = matrix

  return [a * x + c * y + e, b * x + d * y + f]
}

const numberAttr = (element: Element, name: string) => Number(element.getAttribute(name))

const expectPoint = (actual: number[], expected: readonly [number, number]) => {
  expect(actual[0]).toBeCloseTo(expected[0], 4)
  expect(actual[1]).toBeCloseTo(expected[1], 4)
}

const expectOutsideTransformedPlaneContent = (element: Element) => {
  expect(element.closest('.svg-plane__content')).toBeNull()
}

const pathBounds = (d: string) => {
  const values = d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? []

  expect(values.length).toBeGreaterThan(0)
  expect(values.length % 2).toBe(0)

  const points = Array.from({ length: values.length / 2 }, (_, index) => ({
    x: values[index * 2],
    y: values[index * 2 + 1]
  }))
  const xs = points.map((point) => point.x)
  const ys = points.map((point) => point.y)

  return {
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys)
  }
}

describe('docs homepage', () => {
  it('registers the shared homepage component in the VitePress theme', () => {
    const themeSource = readText('docs/.vitepress/theme/index.ts')

    expect(themeSource).toContain("import HomePage from '../components/HomePage.vue'")
    expect(themeSource).toContain("app.component('HomePage', HomePage)")
  })

  it('mounts the shared homepage without docs navigation chrome in both locales', () => {
    const rootHomeSource = readText('docs/index.md')
    const englishHomeSource = readText('docs/en/index.md')

    for (const source of [rootHomeSource, englishHomeSource]) {
      expect(source).toContain('homepage: true')
      expect(source).toContain('sidebar: false')
      expect(source).toContain('outline: false')
      expect(source).toContain('<HomePage />')
    }

    const layoutSource = readText('docs/.vitepress/theme/layout.vue')

    expect(layoutSource).toContain('isHomepage')
    expect(layoutSource).toContain('v-if="!isHomepage"')
  })

  it('keeps localized content separate from the illustration structure', () => {
    const homeSource = readText('docs/.vitepress/components/HomePage.vue')

    expect(homeSource).toContain('<HomeExplodedIllustration')
    expect(homeSource).toContain("localeIndex.value === 'en'")
    expect(homeSource).toContain("link: '/guide/getting-started'")
    expect(homeSource).toContain("link: '/en/guide/getting-started'")
    expect(homeSource).toContain('four-plane UI system illustration')
    expect(homeSource).toContain('四层 UI 系统爆炸图')
    expect(homeSource).not.toContain('three-layer UI system illustration')
    expect(homeSource).not.toContain('三层 UI 系统爆炸图')
  })

  it('keeps the homepage focused on the hero illustration only', () => {
    const homeSource = readText('docs/.vitepress/components/HomePage.vue')

    expect(homeSource).not.toContain('falcon-homepage__benefits')
    expect(homeSource).not.toContain('falcon-homepage__overview')
  })

  it('renders an accessible four-plane inline SVG exploded-view illustration', () => {
    const illustrationSource = readText('docs/.vitepress/components/HomeExplodedIllustration.vue')

    expect(illustrationSource).toContain('home-exploded-illustration')
    expect(illustrationSource).toContain('<svg')
    expect(illustrationSource).toContain('viewBox="0 0 1672 941"')
    expect(illustrationSource).toContain('preserveAspectRatio="xMidYMid meet"')
    expect(illustrationSource).toContain('Foundation')
    expect(illustrationSource).toContain('Layout')
    expect(illustrationSource).toContain('Template')
    expect(illustrationSource).toContain('svg-plane--template')
    expect(illustrationSource).toContain('svg-plane--components')
    expect(illustrationSource).toContain('svg-plane--content')
    expect(illustrationSource).toContain('svg-plane--foundation')
    expect(illustrationSource).toContain('svg-connector--left')
    expect(illustrationSource).toContain('svg-connector--center')
    expect(illustrationSource).toContain('svg-connector--right')
    expect(illustrationSource).toContain('--svg-panel-dark')
    expect(illustrationSource).toContain('--svg-card-dark')
    expect(illustrationSource).toContain(':global(.dark .home-exploded-illustration)')
    expect(illustrationSource).toContain('aria-label')
    expect(illustrationSource).not.toContain('<img')
    expect(illustrationSource).toContain('prefers-reduced-motion: reduce')
    expect(illustrationSource).toContain('@media (max-width: 767px)')
    expect(illustrationSource).not.toContain('drop-shadow')
    expect(illustrationSource).not.toContain('--svg-shadow')
    expect(illustrationSource).not.toContain('svg-glow')
    expect(illustrationSource).toContain(':transform="plane.transform"')
    expect(illustrationSource).not.toContain('rotate(')
    expect(illustrationSource).toContain('svg-foundation-glyphs')
    expect(illustrationSource).not.toContain('svg-float')
  })

  it('maps each SVG plane-local coordinate space onto its panel corners', () => {
    const wrapper = mount(HomeExplodedIllustration)

    for (const [name, plane] of Object.entries(expectedPlanes)) {
      const content = wrapper.find(`.svg-plane--${name} .svg-plane__content`)

      expect(content.exists()).toBe(true)

      const matrix = parseMatrix(content.attributes('transform') ?? '')
      const [topLeft, topRight, bottomRight, bottomLeft] = plane.points

      expectPoint(mapPoint(matrix, 0, 0), topLeft)
      expectPoint(mapPoint(matrix, planeWidth, 0), topRight)
      expectPoint(mapPoint(matrix, planeWidth, planeHeight), bottomRight)
      expectPoint(mapPoint(matrix, 0, planeHeight), bottomLeft)
    }
  })

  it('keeps plane content inside a 10-unit inset with 10-unit card gaps and 4-unit card radii', () => {
    const wrapper = mount(HomeExplodedIllustration)

    for (const [name, plane] of Object.entries(expectedPlanes)) {
      const cards = wrapper.findAll(`.svg-plane--${name} .svg-card`).map((card) => card.element)

      expect(cards).toHaveLength(plane.cards.length)

      for (const [index, expectedCard] of plane.cards.entries()) {
        const card = cards[index]

        expect(numberAttr(card, 'x')).toBe(expectedCard.x)
        expect(numberAttr(card, 'y')).toBe(planePadding)
        expect(numberAttr(card, 'width')).toBe(expectedCard.width)
        expect(numberAttr(card, 'height')).toBe(planeHeight - planePadding * 2)
        expect(numberAttr(card, 'rx')).toBe(4)
        expect(numberAttr(card, 'ry')).toBe(4)

        if (index > 0) {
          const previousCard = plane.cards[index - 1]
          const previousRight = previousCard.x + previousCard.width

          expect(expectedCard.x - previousRight).toBe(planeGap)
        }
      }

      const firstCard = plane.cards[0]
      const lastCard = plane.cards[plane.cards.length - 1]

      expect(firstCard.x).toBe(planePadding)
      expect(lastCard.x + lastCard.width).toBe(planeWidth - planePadding)
    }
  })

  it('keeps foundation shape glyphs outside the non-uniform plane content transform', () => {
    const wrapper = mount(HomeExplodedIllustration)
    const foundation = wrapper.find('.svg-plane--foundation')
    const content = foundation.find('.svg-plane__content')
    const overlay = foundation.find('.svg-foundation-glyphs')
    const matrix = parseMatrix(content.attributes('transform') ?? '')
    const foundationPlane = expectedPlanes.foundation
    const [topLeft, topRight, bottomRight, bottomLeft] = foundationPlane.points
    const foundationCards = foundation.findAll('.svg-card').map((card) => card.element)

    expect(overlay.exists()).toBe(true)
    expect(content.element.nextElementSibling).toBe(overlay.element)

    expectPoint(mapPoint(matrix, 0, 0), topLeft)
    expectPoint(mapPoint(matrix, planeWidth, 0), topRight)
    expectPoint(mapPoint(matrix, planeWidth, planeHeight), bottomRight)
    expectPoint(mapPoint(matrix, 0, planeHeight), bottomLeft)

    for (const [index, expectedCard] of foundationPlane.cards.entries()) {
      const card = foundationCards[index]

      expect(numberAttr(card, 'x')).toBe(expectedCard.x)
      expect(numberAttr(card, 'y')).toBe(expectedCard.y)
      expect(numberAttr(card, 'width')).toBe(expectedCard.width)
      expect(numberAttr(card, 'height')).toBe(expectedCard.height)
    }

    const roundGlyphs = [
      { selector: '.svg-swatch-oval', localRadius: 20 },
      { selector: '.svg-theme-dot', localRadius: 22 },
      { selector: '.svg-radio', localRadius: 15 }
    ]

    for (const { selector, localRadius } of roundGlyphs) {
      const glyphs = foundation.findAll(selector).map((glyph) => glyph.element)

      expect(glyphs.length).toBeGreaterThan(0)

      for (const glyph of glyphs) {
        expectOutsideTransformedPlaneContent(glyph)
        expect(glyph.parentElement).toBe(overlay.element)
        expect(glyph.tagName.toLowerCase()).toBe('path')
        expect(glyph.getAttribute('rx')).toBeNull()
        expect(glyph.getAttribute('ry')).toBeNull()

        const bounds = pathBounds(glyph.getAttribute('d') ?? '')

        expect(bounds.width / localRadius).toBeGreaterThan(2)
        expect(bounds.width / localRadius).toBeLessThan(3.5)
        expect(bounds.height / localRadius).toBeGreaterThan(0.8)
        expect(bounds.height / localRadius).toBeLessThan(1.5)
      }
    }

    const triangle = foundation.find('.svg-swatch-triangle')

    expect(triangle.exists()).toBe(true)
    expectOutsideTransformedPlaneContent(triangle.element)
    expect(triangle.element.parentElement).toBe(overlay.element)
  })

  it('aligns SVG layer panels to four connector anchors on each vertical guide', () => {
    const illustrationSource = readText('docs/.vitepress/components/HomeExplodedIllustration.vue')
    const wrapper = mount(HomeExplodedIllustration)
    const connectorAnchors = {
      left: [
        [400, 120],
        [400, 340],
        [400, 560],
        [400, 790]
      ],
      center: [
        [1135, 180],
        [1135, 420],
        [1135, 660],
        [1135, 920]
      ],
      right: [
        [1435, 60],
        [1435, 260],
        [1435, 460],
        [1435, 660]
      ]
    } as const
    const { left, center, right } = connectorAnchors

    expect(right[3][1]).toBe(center[2][1])
    expect(left[3][1]).toBe((center[2][1] + center[3][1]) / 2)

    for (const [connector, anchors] of Object.entries(connectorAnchors)) {
      const groupSource = readConnectorGroup(
        illustrationSource,
        connector as 'left' | 'center' | 'right'
      )

      expect(groupSource.match(/<circle /g)).toHaveLength(4)
      expect(groupSource).toContain(
        `<line x1="${anchors[0][0]}" x2="${anchors[0][0]}" y1="${anchors[0][1]}" y2="${
          anchors[3][1]
        }" />`
      )

      for (const [x, y] of anchors) {
        expect(groupSource).toContain(`<circle cx="${x}" cy="${y}" r="9" />`)
      }
    }

    for (const [name, plane] of Object.entries(expectedPlanes)) {
      const panel = wrapper.find(`.svg-plane--${name} .svg-plane__panel`)
      const expectedPoints = plane.points.map(([x, y]) => `${x} ${y}`).join(' ')

      expect(panel.exists()).toBe(true)
      expect(panel.attributes('points')).toBe(expectedPoints)
    }
  })

  it('draws exploded planes from back to front so upper layers remain on top', () => {
    const wrapper = mount(HomeExplodedIllustration)
    const scene = wrapper.find('.svg-scene')
    const renderedOrder = Array.from(scene.element.children).map((child) =>
      child.getAttribute('class')
    )

    expect(renderedOrder).toEqual([
      'svg-plane svg-plane--foundation',
      'svg-plane svg-plane--content',
      'svg-plane svg-plane--components',
      'svg-plane svg-plane--template',
      'svg-connectors'
    ])
  })
})
