import type { FlLoadingAnimation, FlLoadingSize } from './loading'
import type { ModeFrame, OrbFrame } from './loading-frame'
import { resolvePreset } from './loading-presets'
import { frameGlobe } from './animations/searching'
import { frameRubik } from './animations/solving'
import { frameWave } from './animations/listening'
import { frameOrbits } from './animations/working'
import { frameRibbon } from './animations/composing'
import { frameMorph } from './animations/shaping'
import { frameEarth } from './animations/earth'

const frames: Record<Exclude<FlLoadingAnimation, 'earth'>, ModeFrame> = {
  searching: frameGlobe,
  solving: frameRubik,
  listening: frameWave,
  working: frameOrbits,
  composing: frameRibbon,
  shaping: frameMorph
}
export function createLoadingFrame(
  animation: FlLoadingAnimation,
  size: FlLoadingSize,
  time: number
) {
  if (animation === 'earth') return frameEarth(size, time)
  const { speed, opts } = resolvePreset(animation, size)
  const frame = frames[animation](size, time * speed, opts)
  // Evenly subsample tiny indicators without destroying the relative spatial arrangement.
  if (size === 20 && frame.dots.length > 120) {
    const count = frame.dots.length
    frame.dots = Array.from({ length: 120 }, (_, i) => frame.dots[Math.floor((i * count) / 120)])
  }
  return frame
}

export function paintLoadingFrame(ctx: CanvasRenderingContext2D, frame: OrbFrame, color: string) {
  ctx.fillStyle = color
  for (const dot of frame.dots) {
    ctx.globalAlpha = Math.max(0, Math.min(1, (dot.a ?? 1) * (1 - dot.white)))
    ctx.beginPath()
    ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}
