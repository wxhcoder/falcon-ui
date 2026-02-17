import type { ExtractPublicPropTypes } from 'vue'

export const flInputProps = {
  debugLabel: {
    type: String,
    default: ''
  },
  debugMode: {
    type: Boolean,
    default: false
  }
} as const

export interface FlInputCustomPayload {
  length: number
  value: string
}

export interface FlInputDebugPayload {
  label: string
  value: string
}

export const flInputEmits = {
  'custom-input': (payload: FlInputCustomPayload) =>
    typeof payload.value === 'string' && typeof payload.length === 'number',
  'debug-event': (payload: FlInputDebugPayload) =>
    typeof payload.label === 'string' && typeof payload.value === 'string'
} as const

export type FlInputProps = ExtractPublicPropTypes<typeof flInputProps>
export type FlInputEmits = typeof flInputEmits

export type InputProps = FlInputProps
export type InputEmits = FlInputEmits
