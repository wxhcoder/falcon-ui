import type { ExtractPublicPropTypes } from 'vue'

export const flButtonProps = {
  debugLabel: {
    type: String,
    default: ''
  },
  debugMode: {
    type: Boolean,
    default: false
  }
} as const

export interface FlButtonDebugPayload {
  label: string
}

export const flButtonEmits = {
  'debug-click': (payload: FlButtonDebugPayload) => typeof payload.label === 'string'
} as const

export type FlButtonProps = ExtractPublicPropTypes<typeof flButtonProps>
export type FlButtonEmits = typeof flButtonEmits

export type ButtonProps = FlButtonProps
export type ButtonEmits = FlButtonEmits
