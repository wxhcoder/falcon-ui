// Tunings adapted from Thinking Orbs de85557 (MIT); see THIRD_PARTY_NOTICES.md.
import { BASE_PROFILES, scaleCounts, scaleRadii } from './loading-profiles'
import type { ModeOpts } from './loading-profiles'
import type { FlLoadingAnimation, FlLoadingSize } from './loading'

const presets = {
  working: ['orbits', 1.885, 1, 1, 3.9, 0.238, 2.4],
  searching: ['globe', 2.015, 0.42, 1.15, 2.665, 0.105, 1.75],
  solving: ['rubik', 1.82, 0.35, 1.05, 1.95, 0.088, 1.9],
  listening: ['wave', 4.388, 0.341, 1, 3.998, 0.105, 1.6],
  composing: ['ribbon', 2.34, 0.25, 0.85, 3.12, 0.051, 1.073],
  shaping: ['morph', 2.405, 0.702, 0.395, 2.08, 0.53, 1.011]
} as const
const cache = new Map<string, { speed: number; opts: ModeOpts }>()

export function resolvePreset(animation: FlLoadingAnimation, size: FlLoadingSize) {
  const key = `${animation}-${size}`
  const hit = cache.get(key)
  if (hit) return hit
  if (animation === 'earth') return { speed: 1, opts: {} }
  const [mode, bigSpeed, bigCount, bigRadius, smallSpeed, smallCount, smallRadius] =
    presets[animation]
  const blend = Math.max(0, Math.min(1, (size - 20) / 44))
  const count = smallCount + (bigCount - smallCount) * blend
  const radius = smallRadius + (bigRadius - smallRadius) * blend
  let opts = scaleRadii(scaleCounts(BASE_PROFILES[mode], count), radius)
  if (animation === 'searching') opts = { ...opts, scanMul: 4.08, dimBase: 0.45 }
  if (animation === 'composing') opts = { ...opts, spin: 0, bandMul: 3.9, wobMul: 1 }
  if (animation === 'shaping') opts = { ...opts, spread: 1.45 }
  const resolved = { speed: smallSpeed + (bigSpeed - smallSpeed) * blend, opts }
  cache.set(key, resolved)
  return resolved
}
