// Adapted from Thinking Orbs (MIT), Jakub Antalik, commit de85557.
// See packages/components/loading/THIRD_PARTY_NOTICES.md.
import type { ModeOpts } from './loading-profiles'
import type { OrbFrame } from './loading-geometry'
export type { Dot, OrbFrame } from './loading-geometry'
export type ModeFrame = (size: number, time: number, options: ModeOpts) => OrbFrame
