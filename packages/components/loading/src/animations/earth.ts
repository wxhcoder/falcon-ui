import { earthPointData } from '../earth-points'
import { angleDelta, finalizeFrame, makeProj } from '../loading-geometry'
import type { Dot, OrbFrame } from '../loading-frame'
import type { FlLoadingSize } from '../loading'

export interface EarthPoint {
  x: number
  y: number
  z: number
  lon: number
  land: boolean
}
const cache = new Map<FlLoadingSize, EarthPoint[]>()

/** Reconstruct stable geographic positions once, not on every animation frame. */
export function getEarthPoints(size: FlLoadingSize): EarthPoint[] {
  const hit = cache.get(size)
  if (hit) return hit
  const { rings, flags } = earthPointData[size]
  const points: EarthPoint[] = []
  let index = 0
  for (let row = 0; row < rings; row++) {
    const lat = -Math.PI / 2 + ((row + 0.5) / rings) * Math.PI
    const count = Math.max(1, Math.round(2 * rings * Math.cos(lat)))
    for (let col = 0; col < count; col++, index++) {
      const lon = -Math.PI + (col / count) * 2 * Math.PI
      const land = flags[index] === '1'
      if (!land && index % 3 !== 0) continue
      points.push({
        x: Math.cos(lat) * Math.cos(lon),
        y: Math.sin(lat),
        z: Math.cos(lat) * Math.sin(lon),
        lon,
        land
      })
    }
  }
  cache.set(size, points)
  return points
}

export function frameEarth(size: FlLoadingSize, time: number): OrbFrame {
  // Looking at 35°E initially: Africa, Europe and western Asia. East-positive coordinates.
  const yaw = (35 * Math.PI) / 180 - Math.PI / 2 + time * 0.22
  const project = makeProj(yaw, 0.18, size / 2, size / 2, size * 0.43)
  const dots: Dot[] = []
  for (const p of getEarthPoints(size)) {
    const [x, y, z] = project(p.x, p.y, p.z)
    if (z <= 0) continue
    const scan = Math.exp(-Math.pow(angleDelta(p.lon, time * 0.9), 2) / 0.08)
    const edge = Math.min(1, z / 0.14)
    dots.push({
      x,
      y,
      z,
      r:
        (size <= 32 ? 0.48 : 0.52) *
        (size / 64) ** 0.25 *
        (1 + 0.2 * z + (p.land ? 0.22 * scan : 0)),
      white: p.land ? 0.08 + 0.2 * (1 - z) : 0.65,
      a: edge * (p.land ? 0.82 + scan * 0.18 : 0.2)
    })
  }
  return finalizeFrame(dots, [], 0.3)
}
