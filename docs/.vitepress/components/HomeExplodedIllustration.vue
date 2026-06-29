<template>
  <div class="home-exploded-illustration" role="img" :aria-label="label">
    <svg
      class="home-exploded-illustration__svg"
      viewBox="0 0 1672 941"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true">
      <defs>
        <linearGradient id="homeExplodedPlaneSheen" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="var(--svg-sheen)" />
          <stop offset="42%" stop-color="transparent" />
        </linearGradient>
        <linearGradient id="homeExplodedPreviewFill" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="var(--svg-preview-a)" />
          <stop offset="100%" stop-color="var(--svg-preview-b)" />
        </linearGradient>
      </defs>

      <g class="svg-scene">
        <g v-for="plane in planes" :key="plane.name" class="svg-plane" :class="plane.className">
          <polygon
            class="svg-plane__panel"
            :class="{ 'svg-plane__panel--strong': plane.strong }"
            :points="plane.pointsValue" />
          <polygon class="svg-plane__sheen" :points="plane.pointsValue" />
          <g class="svg-plane__content" :transform="plane.transform">
            <rect
              v-for="cardItem in plane.cards"
              :key="cardItem.key"
              class="svg-card"
              :x="cardItem.x"
              :y="cardItem.y"
              :width="cardItem.width"
              :height="cardItem.height"
              :rx="cardItem.rx"
              :ry="cardItem.ry" />

            <template v-if="plane.name === 'foundation'">
              <text class="svg-layer-kicker" x="30" y="34">Foundation</text>
              <text class="svg-label" x="30" y="62">Foundation</text>
              <rect class="svg-swatch-square" x="30" y="86" width="40" height="40" rx="2" />
              <rect class="svg-mini-token" x="30" y="154" width="52" height="30" rx="7" />
              <rect class="svg-mini-token" x="100" y="154" width="52" height="30" rx="7" />

              <text class="svg-layer-kicker" x="280" y="34">Tokens</text>
              <text class="svg-label" x="280" y="62">Theme</text>
              <rect class="svg-mini-token" x="280" y="154" width="54" height="30" rx="7" />
              <rect class="svg-mini-token" x="352" y="154" width="54" height="30" rx="7" />
              <text class="svg-token-text" x="307" y="174" text-anchor="middle">Aa</text>
              <text class="svg-token-text" x="379" y="174" text-anchor="middle">R2</text>

              <text class="svg-layer-kicker" x="535" y="34">Controls</text>
              <text class="svg-label" x="535" y="62">Form</text>
              <rect class="svg-check" x="535" y="88" width="30" height="30" rx="5" />
              <rect class="svg-toggle" x="655" y="89" width="58" height="29" rx="15" />
              <rect class="svg-input" x="535" y="153" width="148" height="30" rx="5" />
            </template>

            <template v-else-if="plane.name === 'content'">
              <text class="svg-layer-kicker" x="30" y="34">Content</text>
              <text class="svg-label" x="30" y="62">Trees</text>
              <g class="svg-tree">
                <path d="M34 84h18v14H34z" />
                <rect x="70" y="87" width="96" height="9" rx="5" />
                <path d="M34 114h18v14H34z" />
                <rect x="70" y="117" width="128" height="9" rx="5" />
                <rect class="is-selected" x="26" y="141" width="320" height="28" rx="8" />
                <path d="M34 148h18v14H34z" />
                <text class="svg-blue-text" x="70" y="164">Atoms</text>
                <path d="M34 180h18v14H34z" />
                <rect x="70" y="183" width="112" height="9" rx="5" />
              </g>

              <text class="svg-layer-kicker" x="405" y="34">Preview</text>
              <rect class="svg-preview" x="425" y="50" width="220" height="100" rx="4" ry="4" />
              <path class="svg-preview-mountain" d="M454 131l67-60 44 42 29-25 66 43z" />
              <circle class="svg-preview-sun" cx="594" cy="79" r="18" />
              <rect class="svg-line" x="425" y="164" width="210" height="10" rx="5" />
              <rect class="svg-line" x="445" y="184" width="170" height="10" rx="5" />
            </template>

            <template v-else-if="plane.name === 'components'">
              <text class="svg-layer-kicker" x="30" y="34">Layout</text>
              <text class="svg-label" x="30" y="62">Buttons</text>
              <rect class="svg-button" x="30" y="82" width="128" height="34" rx="8" />
              <text class="svg-button-text" x="94" y="104" text-anchor="middle">Primary</text>
              <rect class="svg-chip" x="30" y="132" width="96" height="22" rx="10" />
              <rect class="svg-chip" x="30" y="164" width="76" height="22" rx="10" />
              <text class="svg-blue-text" x="166" y="184">+ Add</text>

              <text class="svg-layer-kicker" x="280" y="34">Overlay</text>
              <text class="svg-label" x="280" y="62">Dialog</text>
              <text class="svg-caption" x="280" y="92">Dialog title</text>
              <rect class="svg-line" x="280" y="108" width="150" height="9" rx="5" />
              <rect class="svg-line" x="280" y="130" width="118" height="9" rx="5" />
              <text class="svg-muted-text" x="292" y="176">Cancel</text>
              <rect class="svg-button" x="405" y="153" width="78" height="30" rx="8" />
              <text
                class="svg-button-text svg-button-text--tiny"
                x="444"
                y="173"
                text-anchor="middle">
                Confirm
              </text>

              <text class="svg-layer-kicker" x="535" y="34">Data</text>
              <text class="svg-label" x="535" y="62">Table</text>
              <text class="svg-caption" x="535" y="92">Name</text>
              <text class="svg-caption" x="605" y="92">Role</text>
              <text class="svg-caption" x="666" y="92">Status</text>
              <line class="svg-rule" x1="535" x2="730" y1="105" y2="105" />
              <rect class="svg-line svg-line--cell" x="535" y="124" width="52" height="8" rx="4" />
              <rect class="svg-line svg-line--cell" x="605" y="124" width="42" height="8" rx="4" />
              <circle class="svg-status" cx="690" cy="128" r="5" />
              <rect class="svg-line svg-line--cell" x="535" y="152" width="60" height="8" rx="4" />
              <rect class="svg-line svg-line--cell" x="605" y="152" width="40" height="8" rx="4" />
              <circle class="svg-status" cx="690" cy="156" r="5" />
            </template>

            <template v-else>
              <text class="svg-layer-kicker" x="30" y="34">Template</text>
              <path class="svg-logo" d="M95 58l22 12-22 12-22-12z" />
              <rect class="svg-line svg-line--short" x="42" y="100" width="94" height="9" rx="5" />
              <rect class="svg-line svg-line--short" x="34" y="128" width="112" height="9" rx="5" />
              <rect
                class="svg-chip svg-chip--soft"
                x="32"
                y="153"
                width="116"
                height="28"
                rx="12" />

              <g class="svg-toolbar">
                <rect x="640" y="28" width="26" height="24" rx="5" />
                <rect x="676" y="28" width="26" height="24" rx="5" />
                <rect x="712" y="28" width="26" height="24" rx="5" />
                <circle class="svg-mark" cx="548" cy="40" r="8" />
              </g>
              <text class="svg-title" x="230" y="64">Getting Started</text>
              <rect class="svg-line" x="230" y="92" width="310" height="13" rx="7" />
              <rect class="svg-line" x="230" y="120" width="410" height="18" rx="9" />
              <rect class="svg-button" x="230" y="156" width="124" height="34" rx="8" />
              <text class="svg-button-text" x="292" y="178" text-anchor="middle">Preview</text>
              <rect class="svg-pill" x="374" y="156" width="108" height="34" rx="16" />
              <text class="svg-pill-text" x="428" y="178" text-anchor="middle">Code</text>
              <g class="svg-tools">
                <rect x="520" y="158" width="36" height="30" rx="8" />
                <rect x="570" y="158" width="36" height="30" rx="8" />
                <rect class="is-active" x="620" y="158" width="36" height="30" rx="8" />
              </g>
            </template>
          </g>
          <g v-if="plane.name === 'foundation'" class="svg-foundation-glyphs" aria-hidden="true">
            <path
              v-for="glyph in foundationRoundGlyphs"
              :key="glyph.key"
              :class="glyph.className"
              :d="glyph.d" />
            <path
              v-for="glyph in foundationPathGlyphs"
              :key="glyph.key"
              :class="glyph.className"
              :d="glyph.d" />
          </g>
        </g>

        <g class="svg-connectors" aria-hidden="true">
          <g class="svg-connector svg-connector--left">
            <line x1="400" x2="400" y1="120" y2="790" />
            <circle cx="400" cy="120" r="9" />
            <circle cx="400" cy="340" r="9" />
            <circle cx="400" cy="560" r="9" />
            <circle cx="400" cy="790" r="9" />
          </g>
          <g class="svg-connector svg-connector--center">
            <line x1="1135" x2="1135" y1="180" y2="920" />
            <circle cx="1135" cy="180" r="9" />
            <circle cx="1135" cy="420" r="9" />
            <circle cx="1135" cy="660" r="9" />
            <circle cx="1135" cy="920" r="9" />
          </g>
          <g class="svg-connector svg-connector--right">
            <line x1="1435" x2="1435" y1="60" y2="660" />
            <circle cx="1435" cy="60" r="9" />
            <circle cx="1435" cy="260" r="9" />
            <circle cx="1435" cy="460" r="9" />
            <circle cx="1435" cy="660" r="9" />
          </g>
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
type PlaneName = 'foundation' | 'content' | 'components' | 'template'
type Point = readonly [number, number]
type PlanePoints = readonly [Point, Point, Point, Point]
type Matrix = readonly [number, number, number, number, number, number]

interface CardGeometry {
  key: string
  x: number
  y: number
  width: number
  height: number
  rx: number
  ry: number
}

interface PlaneProjection {
  matrix: Matrix
  xScale: number
  xUnit: Point
}

interface PlaneGlyphBasis {
  projection: PlaneProjection
  xUnit: Point
  yUnit: Point
  xScale: number
  yScale: number
}

interface RoundGlyphGeometry {
  key: string
  className: string
  d: string
}

interface PathGlyphGeometry {
  key: string
  className: string
  d: string
}

interface PlaneGeometry {
  name: PlaneName
  className: string
  points: PlanePoints
  pointsValue: string
  transform: string
  cards: readonly CardGeometry[]
  strong?: boolean
}

const planeSize = {
  width: 760,
  height: 220
} as const
const planePadding = 10
const cardRadius = 4
const cardHeight = planeSize.height - planePadding * 2
const glyphDepthScale = 0.62
const ellipseKappa = 0.552284749831
const foundationPoints: PlanePoints = [
  [700, 530],
  [1435, 660],
  [1135, 920],
  [400, 790]
]
const contentPoints: PlanePoints = [
  [700, 360],
  [1435, 460],
  [1135, 660],
  [400, 560]
]
const componentsPoints: PlanePoints = [
  [700, 180],
  [1435, 260],
  [1135, 420],
  [400, 340]
]
const templatePoints: PlanePoints = [
  [700, 0],
  [1435, 60],
  [1135, 180],
  [400, 120]
]

const planeClassNames: Record<PlaneName, string> = {
  foundation: 'svg-plane--foundation',
  content: 'svg-plane--content',
  components: 'svg-plane--components',
  template: 'svg-plane--template'
}

const card = (key: string, x: number, width: number): CardGeometry => ({
  key,
  x,
  y: planePadding,
  width,
  height: cardHeight,
  rx: cardRadius,
  ry: cardRadius
})

const formatMatrixNumber = (value: number) => Number(value.toFixed(9)).toString()
const formatGlyphNumber = (value: number) => Number(value.toFixed(3))

const pointsToString = (points: PlanePoints) => points.map(([x, y]) => `${x} ${y}`).join(' ')
const formatPathPoint = ([x, y]: Point) => `${formatGlyphNumber(x)} ${formatGlyphNumber(y)}`

const normalizeVector = ([x, y]: Point): Point => {
  const length = Math.hypot(x, y)

  return [x / length, y / length]
}

const createPlaneMatrix = (points: PlanePoints): Matrix => {
  const [topLeft, topRight, , bottomLeft] = points

  return [
    (topRight[0] - topLeft[0]) / planeSize.width,
    (topRight[1] - topLeft[1]) / planeSize.width,
    (bottomLeft[0] - topLeft[0]) / planeSize.height,
    (bottomLeft[1] - topLeft[1]) / planeSize.height,
    topLeft[0],
    topLeft[1]
  ]
}

const createPlaneTransform = (points: PlanePoints) => {
  const matrix = createPlaneMatrix(points)
  return `matrix(${matrix.map(formatMatrixNumber).join(' ')})`
}

const createPlaneProjection = (points: PlanePoints): PlaneProjection => {
  const matrix = createPlaneMatrix(points)
  const [a, b] = matrix
  const xScale = Math.hypot(a, b)
  const xUnit: Point = [a / xScale, b / xScale]

  return {
    matrix,
    xScale,
    xUnit
  }
}

const createPlaneGlyphBasis = (
  projection: PlaneProjection,
  depthScale = glyphDepthScale
): PlaneGlyphBasis => {
  const [, , c, d] = projection.matrix

  return {
    projection,
    xUnit: projection.xUnit,
    yUnit: normalizeVector([c, d]),
    xScale: projection.xScale,
    yScale: projection.xScale * depthScale
  }
}

const projectPoint = (projection: PlaneProjection, x: number, y: number): Point => {
  const [a, b, c, d, e, f] = projection.matrix

  return [a * x + c * y + e, b * x + d * y + f]
}

const projectGlyphOffset = (basis: PlaneGlyphBasis, x: number, y: number): Point => [
  x * basis.xUnit[0] * basis.xScale + y * basis.yUnit[0] * basis.yScale,
  x * basis.xUnit[1] * basis.xScale + y * basis.yUnit[1] * basis.yScale
]

const projectGlyphPoint = (basis: PlaneGlyphBasis, center: Point, x: number, y: number): Point => {
  const [offsetX, offsetY] = projectGlyphOffset(basis, x, y)

  return [center[0] + offsetX, center[1] + offsetY]
}

const createRoundGlyph = (
  basis: PlaneGlyphBasis,
  key: string,
  className: string,
  x: number,
  y: number,
  radius: number
): RoundGlyphGeometry => {
  const center = projectPoint(basis.projection, x, y)
  const start = projectGlyphPoint(basis, center, radius, 0)
  const segments: readonly (readonly [Point, Point, Point])[] = [
    [
      [radius, radius * ellipseKappa],
      [radius * ellipseKappa, radius],
      [0, radius]
    ],
    [
      [-radius * ellipseKappa, radius],
      [-radius, radius * ellipseKappa],
      [-radius, 0]
    ],
    [
      [-radius, -radius * ellipseKappa],
      [-radius * ellipseKappa, -radius],
      [0, -radius]
    ],
    [
      [radius * ellipseKappa, -radius],
      [radius, -radius * ellipseKappa],
      [radius, 0]
    ]
  ]
  const commands = segments.map(([controlA, controlB, end]) => {
    const controlPointA = projectGlyphPoint(basis, center, controlA[0], controlA[1])
    const controlPointB = projectGlyphPoint(basis, center, controlB[0], controlB[1])
    const endPoint = projectGlyphPoint(basis, center, end[0], end[1])

    return `C${formatPathPoint(controlPointA)} ${formatPathPoint(controlPointB)} ${formatPathPoint(
      endPoint
    )}`
  })

  return {
    key,
    className,
    d: [`M${formatPathPoint(start)}`, ...commands, 'z'].join(' ')
  }
}

const createPathGlyph = (
  basis: PlaneGlyphBasis,
  key: string,
  className: string,
  vertices: readonly Point[]
): PathGlyphGeometry => {
  const center = vertices.reduce<Point>(
    ([sumX, sumY], [x, y]) => [sumX + x / vertices.length, sumY + y / vertices.length],
    [0, 0]
  )
  const projectedCenter = projectPoint(basis.projection, center[0], center[1])
  const points = vertices.map(([x, y]) => {
    const point = projectGlyphPoint(basis, projectedCenter, x - center[0], y - center[1])

    return formatPathPoint(point)
  })

  return {
    key,
    className,
    d: `M${points.join('L')}z`
  }
}

const definePlane = (
  name: PlaneName,
  points: PlanePoints,
  cards: readonly CardGeometry[],
  strong = false
): PlaneGeometry => ({
  name,
  className: planeClassNames[name],
  points,
  pointsValue: pointsToString(points),
  transform: createPlaneTransform(points),
  cards,
  strong
})

const foundationProjection = createPlaneProjection(foundationPoints)
const foundationGlyphBasis = createPlaneGlyphBasis(foundationProjection)
const foundationRoundGlyphs = [
  createRoundGlyph(foundationGlyphBasis, 'swatch-oval', 'svg-swatch-oval', 112, 106, 20),
  createRoundGlyph(foundationGlyphBasis, 'theme-light', 'svg-theme-dot', 306, 108, 22),
  createRoundGlyph(
    foundationGlyphBasis,
    'theme-dark',
    'svg-theme-dot svg-theme-dot--dark',
    366,
    108,
    22
  ),
  createRoundGlyph(
    foundationGlyphBasis,
    'theme-muted',
    'svg-theme-dot svg-theme-dot--muted',
    426,
    108,
    22
  ),
  createRoundGlyph(foundationGlyphBasis, 'form-radio', 'svg-radio', 613, 103, 15)
] as const
const foundationPathGlyphs = [
  createPathGlyph(foundationGlyphBasis, 'swatch-triangle', 'svg-swatch-triangle', [
    [169, 129],
    [207, 74],
    [229, 129]
  ])
] as const

const planes = [
  definePlane('foundation', foundationPoints, [
    card('foundation-foundation', 10, 240),
    card('foundation-theme', 260, 245),
    card('foundation-form', 515, 235)
  ]),
  definePlane('content', contentPoints, [
    card('content-tree', 10, 365),
    card('content-preview', 385, 365)
  ]),
  definePlane('components', componentsPoints, [
    card('components-button', 10, 240),
    card('components-dialog', 260, 245),
    card('components-table', 515, 235)
  ]),
  definePlane(
    'template',
    templatePoints,
    [card('template-nav', 10, 170), card('template-main', 190, 560)],
    true
  )
] as const

withDefaults(
  defineProps<{
    label?: string
  }>(),
  {
    label:
      'A four-plane UI system illustration showing template, layout components, content, and foundation layers'
  }
)
</script>

<style scoped>
.home-exploded-illustration {
  --svg-blue: #174cff;
  --svg-blue-strong: #123fff;
  --svg-blue-soft: rgb(231 237 255 / 82%);
  --svg-text: #111827;
  --svg-muted: #687590;
  --svg-line: #e5ebf6;
  --svg-panel-light: rgb(255 255 255 / 88%);
  --svg-card-light: rgb(252 254 255 / 84%);
  --svg-panel-dark: rgb(17 25 42 / 88%);
  --svg-card-dark: rgb(23 33 54 / 84%);
  --svg-panel: var(--svg-panel-light);
  --svg-card: var(--svg-card-light);
  --svg-sheen: rgb(255 255 255 / 66%);
  --svg-preview-a: rgb(239 244 252 / 86%);
  --svg-preview-b: rgb(248 251 255 / 80%);
  position: relative;
  display: grid;
  width: min(100%, 720px);
  min-height: clamp(430px, 48vw, 610px);
  margin-inline: auto;
  overflow: visible;
  place-items: center;
}

.home-exploded-illustration__svg {
  display: block;
  width: 100%;
  max-width: 720px;
  height: auto;
  overflow: visible;
}

.svg-plane {
  transform-box: fill-box;
  transform-origin: center;
}

.svg-plane__panel {
  fill: var(--svg-panel);
  stroke: rgb(194 207 232 / 64%);
  stroke-width: 1.2;
}

.svg-plane__panel--strong {
  stroke: rgb(169 190 230 / 70%);
}

.svg-plane__sheen {
  fill: url('#homeExplodedPlaneSheen');
  pointer-events: none;
}

.svg-plane__content {
  pointer-events: none;
}

.svg-card {
  fill: var(--svg-card);
  stroke: rgb(220 229 244 / 82%);
  stroke-width: 1.2;
}

.svg-title,
.svg-layer-kicker,
.svg-label,
.svg-caption,
.svg-muted-text,
.svg-blue-text,
.svg-token-text {
  font-family: 'Avenir Next', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.svg-title {
  fill: var(--svg-text);
  font-size: 25px;
  font-weight: 760;
}

.svg-layer-kicker {
  fill: var(--svg-muted);
  font-size: 11px;
  font-weight: 760;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.svg-label {
  fill: var(--svg-text);
  font-size: 15px;
  font-weight: 760;
}

.svg-caption,
.svg-token-text {
  fill: var(--svg-text);
  font-size: 12px;
  font-weight: 700;
}

.svg-muted-text {
  fill: var(--svg-muted);
  font-size: 10px;
  font-weight: 650;
}

.svg-blue-text {
  fill: var(--svg-blue);
  font-size: 12px;
  font-weight: 720;
}

.svg-line,
.svg-chip,
.svg-pill,
.svg-tools rect,
.svg-toolbar rect,
.svg-mini-token,
.svg-input {
  fill: var(--svg-line);
}

.svg-line--short {
  fill: color-mix(in srgb, var(--svg-muted) 18%, transparent);
}

.svg-line--cell {
  fill: color-mix(in srgb, var(--svg-muted) 22%, transparent);
}

.svg-chip,
.svg-pill,
.svg-tools rect,
.svg-toolbar rect,
.svg-mini-token,
.svg-input {
  stroke: rgb(210 220 238 / 86%);
  stroke-width: 1;
}

.svg-chip--soft,
.svg-tools .is-active {
  fill: var(--svg-blue-soft);
}

.svg-logo {
  fill: none;
  stroke: var(--svg-blue);
  stroke-linejoin: round;
  stroke-width: 7;
}

.svg-button,
.svg-check,
.svg-theme-dot,
.svg-swatch-square {
  fill: var(--svg-blue);
}

.svg-button-text,
.svg-pill-text {
  font-family: 'Avenir Next', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 12px;
  font-weight: 730;
}

.svg-button-text {
  fill: #fff;
}

.svg-button-text--tiny {
  font-size: 9px;
}

.svg-pill-text {
  fill: #26334c;
}

.svg-mark {
  fill: var(--svg-blue);
}

.svg-rule,
.svg-connector line {
  fill: none;
  stroke-linecap: round;
}

.svg-rule {
  stroke: var(--svg-line);
  stroke-width: 1.2;
}

.svg-status {
  fill: #16a060;
}

.svg-tree path {
  fill: none;
  stroke: color-mix(in srgb, var(--svg-blue) 68%, var(--svg-line));
  stroke-width: 2;
}

.svg-tree rect {
  fill: color-mix(in srgb, var(--svg-muted) 16%, transparent);
}

.svg-tree .is-selected {
  fill: var(--svg-blue-soft);
  stroke: rgb(23 76 255 / 18%);
}

.svg-preview {
  fill: url('#homeExplodedPreviewFill');
}

.svg-preview-mountain {
  fill: #dfe6f2;
}

.svg-preview-sun {
  fill: #dce4f2;
}

.svg-swatch-oval {
  fill: #a8b7ff;
}

.svg-swatch-triangle {
  fill: #b9c3ff;
}

.svg-theme-dot--dark {
  fill: var(--svg-blue-strong);
}

.svg-theme-dot--muted {
  fill: #dbe4f2;
}

.svg-radio {
  fill: var(--svg-blue);
  stroke: #e4ecff;
  stroke-width: 7;
}

.svg-toggle {
  fill: #dce6ff;
  stroke: rgb(23 76 255 / 18%);
  stroke-width: 1;
}

.svg-toggle + .svg-input {
  fill: var(--svg-line);
}

.svg-connector {
  color: var(--svg-blue);
}

.svg-connector line {
  stroke: color-mix(in srgb, currentColor 36%, transparent);
  stroke-dasharray: 10 10;
  stroke-width: 2;
}

.svg-connector circle {
  fill: var(--svg-panel);
  stroke: currentColor;
  stroke-width: 6;
}

:global(.dark .home-exploded-illustration) {
  --svg-blue: #4d7cff;
  --svg-blue-strong: #6b94ff;
  --svg-blue-soft: rgb(61 88 154 / 42%);
  --svg-text: #e7eefc;
  --svg-muted: #9aa8c1;
  --svg-line: #303c52;
  --svg-panel: var(--svg-panel-dark);
  --svg-card: var(--svg-card-dark);
  --svg-sheen: rgb(91 128 220 / 11%);
  --svg-preview-a: rgb(31 43 65 / 86%);
  --svg-preview-b: rgb(25 34 53 / 84%);
}

:global(.dark .svg-plane__panel),
:global(.dark .svg-card),
:global(.dark .svg-chip),
:global(.dark .svg-pill),
:global(.dark .svg-tools rect),
:global(.dark .svg-toolbar rect),
:global(.dark .svg-mini-token),
:global(.dark .svg-input) {
  stroke-color: rgb(103 126 169 / 28%);
}

:global(.dark .svg-pill-text) {
  fill: #bdc8dc;
}

:global(.dark .svg-preview-mountain),
:global(.dark .svg-preview-sun),
:global(.dark .svg-theme-dot--muted) {
  fill: #445169;
}

:global(.dark .svg-radio) {
  stroke: #2f4167;
}

:global(.dark .svg-toggle) {
  fill: #34445f;
}

@media (prefers-reduced-motion: reduce) {
  .svg-plane {
    animation: none;
  }
}

@media (max-width: 767px) {
  .home-exploded-illustration {
    width: min(100%, 440px);
    min-height: 392px;
  }

  .home-exploded-illustration__svg {
    max-width: 440px;
  }
}
</style>
