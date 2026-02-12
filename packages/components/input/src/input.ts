import type { ExtractPublicPropTypes } from 'vue'

export const fInputProps = {
  debugLabel: {
    type: String,
    default: ''
  },
  debugMode: {
    type: Boolean,
    default: false
  }
} as const

export interface FInputCustomPayload {
  length: number
  value: string
}

export interface FInputDebugPayload {
  label: string
  value: string
}

export const fInputEmits = {
  'custom-input': (payload: FInputCustomPayload) =>
    typeof payload.value === 'string' && typeof payload.length === 'number',
  'debug-event': (payload: FInputDebugPayload) =>
    typeof payload.label === 'string' && typeof payload.value === 'string'
} as const

export type FInputProps = ExtractPublicPropTypes<typeof fInputProps>
export type FInputEmits = typeof fInputEmits

export type InputProps = FInputProps
export type InputEmits = FInputEmits
