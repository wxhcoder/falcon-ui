import type { ExtractPublicPropTypes } from 'vue'

export const fButtonProps = {
  debugLabel: {
    type: String,
    default: ''
  },
  debugMode: {
    type: Boolean,
    default: false
  }
} as const

export interface FButtonDebugPayload {
  label: string
}

export const fButtonEmits = {
  'debug-click': (payload: FButtonDebugPayload) => typeof payload.label === 'string'
} as const

export type FButtonProps = ExtractPublicPropTypes<typeof fButtonProps>
export type FButtonEmits = typeof fButtonEmits

export type ButtonProps = FButtonProps
export type ButtonEmits = FButtonEmits
