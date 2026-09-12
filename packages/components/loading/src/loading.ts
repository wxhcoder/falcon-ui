import type { ExtractPublicPropTypes, PropType } from 'vue'

export const flLoadingAnimations = [
  'working',
  'searching',
  'solving',
  'listening',
  'composing',
  'shaping',
  'earth'
] as const
export const flLoadingSizes = [20, 32, 48, 64, 96] as const
export type FlLoadingAnimation = (typeof flLoadingAnimations)[number]
export type FlLoadingSize = (typeof flLoadingSizes)[number]
export type FlLoadingTheme = 'auto' | 'light' | 'dark'
export type FlLoadingLayout = 'inline' | 'vertical'

export const flLoadingProps = {
  /** Whether to show the indicator. Inactive indicators retain their layout space. */
  active: { type: Boolean, default: true },
  /** Dot animation, including the land-textured Earth. */
  animation: {
    type: String as PropType<FlLoadingAnimation>,
    default: 'searching',
    validator: (v: FlLoadingAnimation) => flLoadingAnimations.includes(v)
  },
  /** Canvas CSS size in pixels. Each size has its own dot density. */
  size: {
    type: Number as PropType<FlLoadingSize>,
    default: 64,
    validator: (v: FlLoadingSize) => flLoadingSizes.includes(v)
  },
  /** Dot color; accepts CSS colors and CSS variables. */
  color: { type: String, default: '' },
  /** Background theme used to choose contrasting dots. */
  theme: { type: String as PropType<FlLoadingTheme>, default: 'auto' },
  /** Animation speed multiplier, clamped to 0.25–3. */
  speed: { type: Number, default: 1 },
  /** Freeze the current animation time. */
  paused: { type: Boolean, default: false },
  /** Accessible, selectable status text. */
  text: { type: String, default: '' },
  /** Position the text beside or below the canvas. */
  layout: { type: String as PropType<FlLoadingLayout>, default: 'inline' },
  /** Accessible label when no visible text is provided. */
  ariaLabel: { type: String, default: '加载中' }
} as const

export type FlLoadingProps = ExtractPublicPropTypes<typeof flLoadingProps>
export const normalizeAnimation = (v: FlLoadingAnimation): FlLoadingAnimation =>
  flLoadingAnimations.includes(v) ? v : 'searching'
export const normalizeSize = (v: FlLoadingSize): FlLoadingSize =>
  flLoadingSizes.includes(v) ? v : 64
export const normalizeSpeed = (v: number) =>
  Number.isFinite(v) ? Math.max(0.25, Math.min(3, v)) : 1
