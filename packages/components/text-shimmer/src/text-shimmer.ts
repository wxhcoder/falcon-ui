import type { ExtractPublicPropTypes, PropType } from 'vue'

export const flTextShimmerTags = ['span', 'p', 'div'] as const

export type FlTextShimmerTag = (typeof flTextShimmerTags)[number]

export const TEXT_SHIMMER_DEFAULT_DURATION = 2
export const TEXT_SHIMMER_DEFAULT_SPREAD = 2

/** Resolve an invalid animation number without allowing invalid CSS values into the component. */
export const normalizeTextShimmerNumber = (
  value: number,
  propName: 'duration' | 'spread',
  fallback: number
) => {
  if (Number.isFinite(value) && value > 0) {
    return value
  }

  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `[FlTextShimmer] \`${propName}\` must be a finite positive number; using ${fallback}.`
    )
  }

  return fallback
}

export const flTextShimmerProps = {
  /** Text displayed when no default slot is provided. */
  text: {
    type: String,
    default: ''
  },
  /** Root HTML tag. */
  as: {
    type: String as PropType<FlTextShimmerTag>,
    default: 'span',
    validator: (value: string) => flTextShimmerTags.includes(value as FlTextShimmerTag)
  },
  /** Seconds required for one full left-to-right pass. */
  duration: {
    type: Number,
    default: TEXT_SHIMMER_DEFAULT_DURATION
  },
  /** Highlight fade distance multiplier. */
  spread: {
    type: Number,
    default: TEXT_SHIMMER_DEFAULT_SPREAD
  },
  /** Base text color. Omit it to inherit the parent color. */
  color: String,
  /** Highlight color. Omit it to inherit the current text color. */
  shimmerColor: String,
  /** Show readable static text without animation. */
  disabled: {
    type: Boolean,
    default: false
  }
} as const

export type FlTextShimmerProps = ExtractPublicPropTypes<typeof flTextShimmerProps>
export type TextShimmerProps = FlTextShimmerProps
