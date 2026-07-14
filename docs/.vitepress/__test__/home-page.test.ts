import fs from 'node:fs'
import path from 'node:path'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import HomeExplodedIllustration from '../components/HomeExplodedIllustration.vue'

const rootDir = path.resolve(__dirname, '../../..')

const readText = (relativePath: string) =>
  fs.readFileSync(path.resolve(rootDir, relativePath), 'utf8')

const planeWidth = 760
const planeHeight = 220
const planePadding = 10
const planeGap = 20
const planeDepth = 18
const referenceLayerGap = 35.5102

const expectedPlanes = {
  template: {
    points: [
      [700, 0],
      [1435, 60],
      [1135, 180],
      [400, 120]
    ],
    cards: [
      { x: 10, y: 10, width: 165, height: 200 },
      { x: 195, y: 10, width: 555, height: 200 }
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
      { x: 10, y: 10, width: 235, height: 200 },
      { x: 265, y: 10, width: 240, height: 200 },
      { x: 525, y: 10, width: 225, height: 200 }
    ]
  },
  content: {
    points: [
      [700, 408.163],
      [1435, 508.163],
      [1135, 708.163],
      [400, 608.163]
    ],
    cards: [
      { x: 10, y: 10, width: 360, height: 200 },
      { x: 390, y: 10, width: 360, height: 200 }
    ]
  },
  foundation: {
    points: [
      [700, 684.49],
      [1435, 814.49],
      [1135, 1074.49],
      [400, 944.49]
    ],
    cards: [
      { x: 10, y: 10, width: 235, height: 200 },
      { x: 265, y: 10, width: 240, height: 200 },
      { x: 525, y: 10, width: 225, height: 200 }
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

const panelCorner = (
  plane: (typeof expectedPlanes)[keyof typeof expectedPlanes],
  corner: 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft'
) => {
  const [topLeft, topRight, bottomRight, bottomLeft] = plane.points

  return {
    topLeft,
    topRight,
    bottomRight,
    bottomLeft
  }[corner]
}

const interpolateYAtX = (
  [start, end]: readonly [readonly [number, number], readonly [number, number]],
  x: number
) => {
  const progress = (x - start[0]) / (end[0] - start[0])

  return start[1] + (end[1] - start[1]) * progress
}

const topYAtX = (plane: (typeof expectedPlanes)[keyof typeof expectedPlanes], x: number) =>
  interpolateYAtX([panelCorner(plane, 'topLeft'), panelCorner(plane, 'topRight')], x)

const bottomYAtX = (plane: (typeof expectedPlanes)[keyof typeof expectedPlanes], x: number) =>
  interpolateYAtX([panelCorner(plane, 'bottomLeft'), panelCorner(plane, 'bottomRight')], x)

const offsetPoint = ([x, y]: readonly [number, number], offsetY: number): [number, number] => [
  x,
  y + offsetY
]

const pointsValue = (points: readonly (readonly [number, number])[]) =>
  points.map(([x, y]) => `${x} ${y}`).join(' ')

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

const relativePolygonBounds = (d: string) => {
  const values = d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? []

  expect(values.length).toBeGreaterThanOrEqual(2)
  expect(values.length % 2).toBe(0)

  const points = [{ x: values[0], y: values[1] }]

  for (let index = 2; index < values.length; index += 2) {
    const previous = points.at(-1) ?? points[0]

    points.push({ x: previous.x + values[index], y: previous.y + values[index + 1] })
  }

  const xs = points.map((point) => point.x)
  const ys = points.map((point) => point.y)

  return {
    left: Math.min(...xs),
    right: Math.max(...xs),
    top: Math.min(...ys),
    bottom: Math.max(...ys)
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
    expect(illustrationSource).toContain('viewBox="0 0 1672 1096"')
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

  it('locks the homepage illustration to a reduced proportional display size', () => {
    const illustrationSource = readText('docs/.vitepress/components/HomeExplodedIllustration.vue')

    expect(illustrationSource).toContain('--home-illustration-width: 960px;')
    expect(illustrationSource).toContain('--home-illustration-mobile-width: 420px;')
    expect(illustrationSource).toContain('aspect-ratio: 1672 / 1096;')
    expect(illustrationSource).toContain('width: min(100%, var(--home-illustration-width));')
    expect(illustrationSource).toContain('max-width: var(--home-illustration-width);')
    expect(illustrationSource).toContain('height: auto;')
    expect(illustrationSource).toContain('width: min(100%, var(--home-illustration-mobile-width));')
    expect(illustrationSource).toContain('max-width: var(--home-illustration-mobile-width);')
    expect(illustrationSource).not.toContain('--home-illustration-width: 1440px;')
    expect(illustrationSource).not.toContain('--home-illustration-mobile-width: 880px;')
    expect(illustrationSource).not.toContain('scaleX(')
    expect(illustrationSource).not.toContain('scaleY(')
  })

  it('keeps the homepage hero vertically centered without page overflow', () => {
    const homeSource = readText('docs/.vitepress/components/HomePage.vue')

    expect(homeSource).toContain('height: calc(100svh - var(--vp-nav-height, 64px));')
    expect(homeSource).toContain('overflow: hidden;')
    expect(homeSource).toContain('display: grid;')
    expect(homeSource).toContain('align-items: center;')
    expect(homeSource).toContain('min-height: 0;')
    expect(homeSource).toContain(':global(.page-content:has(.falcon-homepage))')
    expect(homeSource).toContain(':global(.doc-content-wrapper:has(.falcon-homepage))')
    expect(homeSource).toContain(':global(.doc-content:has(.falcon-homepage))')
    expect(homeSource).toContain('padding-top: 0;')
    expect(homeSource).toContain('padding: 0;')
    expect(homeSource).not.toContain('min-height: clamp(760px, 52vw, 980px);')
  })

  it('locks the dark-mode illustration color contract', () => {
    const illustrationSource = readText('docs/.vitepress/components/HomeExplodedIllustration.vue')
    const normalizedIllustrationSource = illustrationSource.replace(/\r\n/g, '\n')
    const darkThemeSource =
      illustrationSource.match(
        /:global\(\.dark \.home-exploded-illustration\) \{([\s\S]*?)\}/
      )?.[1] ?? ''
    const darkRaisedFillSource =
      normalizedIllustrationSource.match(
        /:global\(\.dark \.svg-line\),[\s\S]*?fill: #272727;\n\}/
      )?.[0] ?? ''
    const staleDarkColors = [
      '--svg-line: #303c52;',
      '#445169',
      '#34445f',
      '#2f4167',
      'stroke-color: rgb(103 126 169 / 28%)'
    ]

    expect(illustrationSource).toContain('--svg-panel-dark: #141414;')
    expect(illustrationSource).toContain('--svg-card-dark: #111;')
    expect(darkThemeSource).toContain('--svg-line: #111;')
    expect(darkThemeSource).toContain('--svg-mini-token-bg: #272727;')
    expect(darkThemeSource).toContain('--svg-sheen: transparent;')
    expect(darkThemeSource).toContain('--svg-preview-a: #272727;')
    expect(darkThemeSource).toContain('--svg-preview-b: #272727;')
    expect(illustrationSource).toContain('#2e2e2e')
    expect(illustrationSource).toContain(':global(.dark .svg-mini-token)')
    expect(normalizedIllustrationSource).toContain('.svg-input {\n  fill: var(--svg-card);\n}')
    expect(normalizedIllustrationSource).not.toContain('.svg-toggle + .svg-input')
    expect(darkRaisedFillSource).toContain(':global(.dark .svg-line)')
    expect(darkRaisedFillSource).toContain(':global(.dark .svg-toggle)')
    expect(darkRaisedFillSource).not.toContain(':global(.dark .svg-input)')
    expect(darkRaisedFillSource).toContain(':global(.dark .svg-toolbar rect)')
    expect(darkRaisedFillSource).toContain(':global(.dark .svg-pill)')
    expect(darkRaisedFillSource).toContain(':global(.dark .svg-tools rect)')

    for (const staleColor of staleDarkColors) {
      expect(illustrationSource).not.toContain(staleColor)
    }
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

  it('keeps plane content inside a 10-unit inset with 20-unit card gaps and 2-unit card radii', () => {
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
        expect(numberAttr(card, 'rx')).toBe(2)
        expect(numberAttr(card, 'ry')).toBe(2)

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

  it('normalizes rounded inline SVG rects and foundation control sizes', () => {
    const wrapper = mount(HomeExplodedIllustration)
    const swatch = wrapper.find('.svg-swatch-square').element
    const check = wrapper.find('.svg-check').element
    const roundedRects = wrapper.findAll('rect[rx]').map((rect) => rect.element)

    expect(numberAttr(swatch, 'width')).toBe(40)
    expect(numberAttr(swatch, 'height')).toBe(24)
    expect(numberAttr(swatch, 'rx')).toBe(2)

    expect(numberAttr(check, 'width')).toBe(40)
    expect(numberAttr(check, 'height')).toBe(24)
    expect(numberAttr(check, 'rx')).toBe(2)

    expect(roundedRects.length).toBeGreaterThan(0)

    for (const rect of roundedRects) {
      expect(numberAttr(rect, 'rx')).toBe(2)

      if (rect.hasAttribute('ry')) {
        expect(numberAttr(rect, 'ry')).toBe(2)
      }
    }
  })

  it('keeps light-mode illustration panels free of sheen gradients', () => {
    const illustrationSource = readText('docs/.vitepress/components/HomeExplodedIllustration.vue')
    const lightThemeSource =
      illustrationSource.match(/\.home-exploded-illustration \{([\s\S]*?)\}/)?.[1] ?? ''

    expect(lightThemeSource).toContain('--svg-sheen: transparent;')
    expect(lightThemeSource).not.toContain('--svg-sheen: rgb(')
  })

  it('keeps the content preview at a clear 30-unit card inset and contains its mountain', () => {
    const wrapper = mount(HomeExplodedIllustration)
    const contentCards = wrapper.findAll('.svg-plane--content .svg-card')
    const previewCard = contentCards[1].element
    const preview = wrapper.find('.svg-plane--content .svg-preview').element
    const mountain = wrapper.find('.svg-plane--content .svg-preview-mountain').element
    const cardLeft = numberAttr(previewCard, 'x')
    const cardRight = cardLeft + numberAttr(previewCard, 'width')
    const previewLeft = numberAttr(preview, 'x')
    const previewRight = previewLeft + numberAttr(preview, 'width')
    const previewTop = numberAttr(preview, 'y')
    const previewBottom = previewTop + numberAttr(preview, 'height')
    const mountainBounds = relativePolygonBounds(mountain.getAttribute('d') ?? '')

    expect(previewLeft - cardLeft).toBe(30)
    expect(cardRight - previewRight).toBe(30)
    expect(mountainBounds.left).toBeGreaterThanOrEqual(previewLeft)
    expect(mountainBounds.right).toBeLessThanOrEqual(previewRight)
    expect(mountainBounds.top).toBeGreaterThanOrEqual(previewTop)
    expect(mountainBounds.bottom).toBeLessThanOrEqual(previewBottom)
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

  it('locks foundation glyph positions and centers the theme dot group', () => {
    const illustrationSource = readText('docs/.vitepress/components/HomeExplodedIllustration.vue')

    expect(illustrationSource).toContain(
      "createRoundGlyph(foundationGlyphBasis, 'swatch-oval', 'svg-swatch-oval', 117, 106, 20)"
    )
    expect(illustrationSource).toContain('horizontalScale = 1')
    expect(illustrationSource).toMatch(
      /'theme-light', 'svg-theme-dot', 321, 108, 22\)[\s\S]*?'theme-dark',[\s\S]*?385,[\s\S]*?'theme-muted',[\s\S]*?449,/
    )
    expect(
      expectedPlanes.foundation.cards[1].x + expectedPlanes.foundation.cards[1].width / 2
    ).toBe(385)
  })

  it('projects in-plane round marks with the same path geometry as foundation glyphs', () => {
    const wrapper = mount(HomeExplodedIllustration)
    const roundMarks = wrapper.findAll('.svg-mark, .svg-status, .svg-preview-sun')

    expect(roundMarks).toHaveLength(4)

    for (const mark of roundMarks) {
      expect(mark.element.tagName.toLowerCase()).toBe('path')
      expectOutsideTransformedPlaneContent(mark.element)
      expect(mark.element.parentElement?.getAttribute('class')).toBe('svg-plane-round-glyphs')
      expect(mark.attributes('d')).toMatch(/^M.+C.+z$/)
    }
  })

  it('keeps each layer separated by the red reference gap at the leading panel edge', () => {
    const measurementX = 700
    const layerPairs = [
      [expectedPlanes.template, expectedPlanes.components],
      [expectedPlanes.components, expectedPlanes.content],
      [expectedPlanes.content, expectedPlanes.foundation]
    ] as const

    for (const [upperPlane, lowerPlane] of layerPairs) {
      expect(topYAtX(lowerPlane, measurementX) - bottomYAtX(upperPlane, measurementX)).toBeCloseTo(
        referenceLayerGap,
        3
      )
    }
  })

  it('adds a consistent vertical thickness face to all four illustration planes', () => {
    const wrapper = mount(HomeExplodedIllustration)
    const maxViewBoxY = 1096

    for (const [name, plane] of Object.entries(expectedPlanes)) {
      const planeGroup = wrapper.find(`.svg-plane--${name}`)
      const depthFaces = planeGroup.findAll('.svg-plane__depth-face').map((face) => face.element)
      const [topLeft, topRight, bottomRight, bottomLeft] = plane.points
      const expectedFrontFace = pointsValue([
        bottomLeft,
        bottomRight,
        offsetPoint(bottomRight, planeDepth),
        offsetPoint(bottomLeft, planeDepth)
      ])
      const expectedRightFace = pointsValue([
        topRight,
        bottomRight,
        offsetPoint(bottomRight, planeDepth),
        offsetPoint(topRight, planeDepth)
      ])
      const directChildClasses = Array.from(planeGroup.element.children).map((child) =>
        child.getAttribute('class')
      )
      const depthYValues = depthFaces.flatMap((face) => {
        const values =
          face
            .getAttribute('points')
            ?.match(/-?\d+(?:\.\d+)?/g)
            ?.map(Number) ?? []

        return values.filter((_, index) => index % 2 === 1)
      })

      expect(topLeft).toBeDefined()
      expect(depthFaces).toHaveLength(2)
      expect(depthFaces[0].getAttribute('class')).toBe(
        'svg-plane__depth-face svg-plane__depth-face--front'
      )
      expect(depthFaces[0].getAttribute('points')).toBe(expectedFrontFace)
      expect(depthFaces[1].getAttribute('class')).toBe(
        'svg-plane__depth-face svg-plane__depth-face--right'
      )
      expect(depthFaces[1].getAttribute('points')).toBe(expectedRightFace)
      expect(directChildClasses[0]).toBe('svg-plane__depth-face svg-plane__depth-face--front')
      expect(directChildClasses[1]).toBe('svg-plane__depth-face svg-plane__depth-face--right')
      expect(directChildClasses[2]).toContain('svg-plane__panel')
      expect(Math.max(...depthYValues)).toBeLessThanOrEqual(maxViewBoxY)
    }
  })

  it('aligns SVG layer panels to connector anchors derived from their three reference corners', () => {
    const wrapper = mount(HomeExplodedIllustration)
    const planeOrder = ['template', 'components', 'content', 'foundation'] as const
    const connectorCorners = {
      left: 'bottomLeft',
      center: 'bottomRight',
      right: 'topRight'
    } as const

    for (const [connector, corner] of Object.entries(connectorCorners)) {
      const anchors = planeOrder.map((planeName) => panelCorner(expectedPlanes[planeName], corner))
      const connectorGroup = wrapper.find(`.svg-connector--${connector}`)
      const line = connectorGroup.find('line')
      const anchorsElements = connectorGroup.findAll('circle').map((circle) => circle.element)

      expect(connectorGroup.exists()).toBe(true)
      expect(line.exists()).toBe(true)
      expect(anchorsElements).toHaveLength(anchors.length)
      expectPoint([numberAttr(line.element, 'x1'), numberAttr(line.element, 'y1')], anchors[0])
      expectPoint([numberAttr(line.element, 'x2'), numberAttr(line.element, 'y2')], anchors[3])

      for (const [index, anchor] of anchors.entries()) {
        const anchorElement = anchorsElements[index]

        expectPoint([numberAttr(anchorElement, 'cx'), numberAttr(anchorElement, 'cy')], anchor)
        expect(numberAttr(anchorElement, 'r')).toBe(9)
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

  it('stages a one-shot exploded entrance and preserves a reduced-motion final state', () => {
    const illustrationSource = readText('docs/.vitepress/components/HomeExplodedIllustration.vue')
    const normalizedIllustrationSource = illustrationSource.replace(/\r\n/g, '\n')
    const reducedMotionSource =
      normalizedIllustrationSource.match(
        /@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/
      )?.[1] ?? ''

    expect(illustrationSource).toContain('@keyframes home-layer-explode')
    expect(illustrationSource).toContain(
      'animation: home-layer-explode 880ms cubic-bezier(0.22, 1, 0.36, 1) var(--explode-delay) both;'
    )
    expect(illustrationSource).toMatch(
      /\.svg-plane--foundation \{[\s\S]*?--explode-delay: 0ms;[\s\S]*?\.svg-plane--content \{[\s\S]*?--explode-delay: 70ms;[\s\S]*?\.svg-plane--components \{[\s\S]*?--explode-delay: 140ms;[\s\S]*?\.svg-plane--template \{[\s\S]*?--explode-delay: 210ms;/
    )
    expect(illustrationSource).toContain('@keyframes home-connectors-reveal')
    expect(illustrationSource).toContain(
      'animation: home-connectors-reveal 440ms ease-out 720ms both;'
    )
    expect(reducedMotionSource).toContain('.svg-plane,')
    expect(reducedMotionSource).toContain('.svg-connectors')
    expect(reducedMotionSource).toContain('animation: none;')
    expect(reducedMotionSource).toContain('opacity: 1;')
    expect(reducedMotionSource).toContain('transform: none;')
    expect(illustrationSource).not.toContain('animation-iteration-count: infinite')
  })
})
