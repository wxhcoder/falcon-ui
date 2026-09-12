// Adapted from Thinking Orbs (MIT), Jakub Antalik, commit de85557.
// See packages/components/loading/THIRD_PARTY_NOTICES.md.
import type { Dot, ModeFrame } from '../loading-frame'
import { finalizeFrame, makeProj, radiusScale } from '../loading-geometry'
export const frameWave: ModeFrame = (size, t, o) => {
  const cx = size / 2
  const cy = size / 2
  // 0.76 base × 1.15 — the undulation pulls the sphere inward, so wave read
  // ~15% smaller than the other lattice modes; scaled up to match them
  const R = (size / 2) * 0.874
  const pt = makeProj(t * 0.18, 0.38, cx, cy, 1)
  const rs = radiusScale(size, o.rsPow ?? 0.6)

  const dots: Dot[] = []
  const rings = o.rings ?? 15
  const lonDensity = o.lonDensity ?? 40
  for (let ri = 0; ri <= rings; ri++) {
    const lat = -Math.PI / 2 + (ri / rings) * Math.PI
    const cosLat = Math.cos(lat)
    const sinLat = Math.sin(lat)
    // two waves, different tempi — organic, never quite repeating
    const w = 0.62 * Math.sin(t * 2.1 - ri * 0.52) + 0.38 * Math.sin(t * 1.27 + ri * 0.83)
    const rr = R * (0.88 + 0.105 * w)
    const lonCount = Math.max(1, Math.round(Math.abs(cosLat) * lonDensity))
    for (let lj = 0; lj < lonCount; lj++) {
      const lon = (lj / lonCount) * 2 * Math.PI
      const [px, py, z] = pt(cosLat * Math.cos(lon) * rr, sinLat * rr, cosLat * Math.sin(lon) * rr)
      const depth = (z / R + 1) / 2
      const crest = Math.max(0, w)
      dots.push({
        x: px,
        y: py,
        z,
        r: ((o.rBase ?? 0.6) + (o.rDepth ?? 1.7) * depth) * (1 + 0.4 * crest) * rs,
        white: 0.66 - 0.56 * depth - 0.1 * crest
      })
    }
  }
  return finalizeFrame(dots, [], o.rMin)
}
