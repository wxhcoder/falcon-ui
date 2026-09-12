// Adapted from Thinking Orbs (MIT), Jakub Antalik, commit de85557.
// See packages/components/loading/THIRD_PARTY_NOTICES.md.
import type { Dot, ModeFrame } from '../loading-frame'
import { angleDelta, finalizeFrame, makeProj, radiusScale } from '../loading-geometry'
// --- Globe: lat/long field, a scan meridian sweeps — searching --------

export const frameGlobe: ModeFrame = (size, t, o) => {
  const spin = 0.5
  const cx = size / 2
  const cy = size / 2
  const radius = (size / 2) * 0.82
  const tilt = 0.4 + 0.06 * Math.sin(t * 0.35)
  const pt = makeProj(t * spin, tilt, cx, cy, radius)
  // scan sweeps relative to the spin; scanMul scales that relative rate
  const scan = t * (spin + (1.7 - spin) * (o.scanMul ?? 1))
  const rs = radiusScale(size, o.rsPow ?? 0.6)
  const dimBase = o.dimBase ?? 1

  const dots: Dot[] = []
  const latRings = o.latRings ?? 17
  const lonDensity = o.lonDensity ?? 44
  for (let li = 0; li <= latRings; li++) {
    const lat = -Math.PI / 2 + (li / latRings) * Math.PI
    const cosLat = Math.cos(lat)
    const sinLat = Math.sin(lat)
    const lonCount = Math.max(1, Math.round(Math.abs(cosLat) * lonDensity))
    for (let lj = 0; lj < lonCount; lj++) {
      const lon = (lj / lonCount) * 2 * Math.PI
      const [px, py, z] = pt(cosLat * Math.cos(lon), sinLat, cosLat * Math.sin(lon))
      const depth = (z + 1) / 2
      // the scan: a moving meridian read as a size ripple, not a shine
      const d = angleDelta(lon + t * spin, scan)
      const boost = Math.exp(-(d * d) / 0.18) * Math.max(0, z)
      dots.push({
        x: px,
        y: py,
        z,
        r: ((o.rBase ?? 0.6) + (o.rDepth ?? 1.7) * depth + (o.rBoost ?? 1) * boost) * rs,
        white: (o.inkFar ?? 0.62) - (o.inkSpan ?? 0.54) * depth,
        // dimBase < 1 fades un-scanned dots so the meridian reads clearly
        a: dimBase + (1 - dimBase) * Math.min(1, boost)
      })
    }
  }
  return finalizeFrame(dots, [], o.rMin)
}
