import { describe, expect, it } from 'vitest'
import {
  flLoadingAnimations,
  flLoadingSizes,
  normalizeAnimation,
  normalizeSize,
  normalizeSpeed
} from '../src/loading'
import { createLoadingFrame } from '../src/loading-renderer'
import { getEarthPoints } from '../src/animations/earth'
import { makeProj } from '../src/loading-geometry'

describe('loading geometry', () => {
  for (const animation of flLoadingAnimations) {
    it(`${animation}: deterministic, animated, finite at every supported size`, () => {
      for (const size of flLoadingSizes) {
        const a = createLoadingFrame(animation, size, 0.6)
        expect(a).toEqual(createLoadingFrame(animation, size, 0.6))
        expect(a).not.toEqual(createLoadingFrame(animation, size, 1.8))
        expect(a.dots.length).toBeGreaterThan(5)
        if (size === 20) expect(a.dots.length).toBeLessThanOrEqual(120)
        for (const dot of a.dots) {
          expect([dot.x, dot.y, dot.z, dot.r, dot.white].every(Number.isFinite)).toBe(true)
          expect(dot.r).toBeGreaterThan(0)
        }
      }
    })
  }
  it('has seven distinct geometries, not aliases of one spinner', () => {
    expect(
      new Set(flLoadingAnimations.map((a) => JSON.stringify(createLoadingFrame(a, 64, 0.6)))).size
    ).toBe(7)
  })
  it('preserves geographic positions and occludes the far hemisphere', () => {
    const points = getEarthPoints(64)
    expect(getEarthPoints(64)).toBe(points)
    expect(points.some((p) => p.land)).toBe(true)
    expect(points.some((p) => !p.land)).toBe(true)
    expect(points.length).toBeLessThanOrEqual(1500)
    expect(getEarthPoints(96).length).toBeLessThanOrEqual(3000)
    const nearest = (lon: number, lat: number) =>
      getEarthPoints(96).reduce((best, p) => {
        const distance = (q: typeof p) =>
          ((q.lon * 180) / Math.PI - lon) ** 2 + ((Math.asin(q.y) * 180) / Math.PI - lat) ** 2
        return distance(p) < distance(best) ? p : best
      })
    expect(nearest(20, 5).land).toBe(true) // Central Africa
    expect(nearest(135, -25).land).toBe(true) // Australia
    expect(nearest(-140, 0).land).toBe(false) // Pacific Ocean
    for (const t of [0, 4, 12, 25]) {
      expect(createLoadingFrame('earth', 64, t).dots.every((p) => p.z > 0)).toBe(true)
    }
    expect(makeProj(0, 0, 32, 32, 25)(0, 1, 0)[1]).toBeLessThan(32)
  })
  it('normalizes invalid runtime parameters', () => {
    expect(normalizeAnimation('bad' as never)).toBe('searching')
    expect(normalizeSize(99 as never)).toBe(64)
    expect([
      normalizeSpeed(NaN),
      normalizeSpeed(Infinity),
      normalizeSpeed(0),
      normalizeSpeed(10)
    ]).toEqual([1, 1, 0.25, 3])
  })
})
