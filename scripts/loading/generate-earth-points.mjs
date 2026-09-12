import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { format } from 'prettier'

// Download the pinned Natural Earth input separately; this generator never requests the network.
const input = await readFile(process.argv[2] || '.cache/loading/ne_110m_land.geojson')
const hash = createHash('sha256').update(input).digest('hex')
if (hash !== '9e0729ee253ca7d7a5c4ae9395fb1902264c5377c52e224d13dd85010e2835d9') {
  throw new Error('Unexpected Natural Earth data; verify its version before regenerating.')
}
const features = JSON.parse(input).features
const polygons = features.flatMap(({ geometry }) =>
  geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
)
const inRing = (x, y, ring) => {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}
const isLand = (lon, lat) =>
  polygons.some(
    ([outer, ...holes]) => inRing(lon, lat, outer) && !holes.some((hole) => inRing(lon, lat, hole))
  )
// Implicit ring coordinates keep the payload small: each character is a land/ocean flag.
const ringsBySize = { 20: 9, 32: 17, 48: 29, 64: 37, 96: 53 }
const data = {}
for (const [size, rings] of Object.entries(ringsBySize)) {
  let flags = ''
  for (let row = 0; row < rings; row++) {
    const lat = -90 + ((row + 0.5) / rings) * 180
    const count = Math.max(1, Math.round(2 * rings * Math.cos((lat * Math.PI) / 180)))
    for (let col = 0; col < count; col++) {
      flags += isLand(-180 + (col / count) * 360, lat) ? '1' : '0'
    }
  }
  data[size] = { rings, flags }
}
await writeFile(
  new URL('../../packages/components/loading/src/earth-points.ts', import.meta.url),
  await format(
    `// Generated from Natural Earth v5.1.2. Do not edit; see THIRD_PARTY_NOTICES.md.\n` +
      `// Input SHA256: ${hash}\nexport const earthPointData = ${JSON.stringify(data)} as const\n`,
    {
      parser: 'typescript',
      singleQuote: true,
      semi: false,
      trailingComma: 'none',
      endOfLine: 'crlf',
      printWidth: 100
    }
  )
)
