import type { ExtractPublicPropTypes } from 'vue'

export const flInputProps = {
  /**
   * 调试事件标签，在开启调试模式后会随 `debug-event` 一起抛出。
   */
  debugLabel: {
    type: String,
    default: ''
  },
  /**
   * 是否开启调试事件派发，开启后每次输入都会触发调试事件。
   */
  debugMode: {
    type: Boolean,
    default: false
  }
} as const

export interface FlInputCustomPayload {
  /**
   * 当前输入字符串长度。
   */
  length: number
  /**
   * 底层 ElInput 当前输入值。
   */
  value: string
}

export interface FlInputDebugPayload {
  /**
   * 用于标识输入来源的业务标签。
   */
  label: string
  /**
   * 触发调试事件时的当前输入值。
   */
  value: string
}

export const flInputEmits = {
  /**
   * 原生输入变化时触发，携带当前值与字符长度。
   */
  'custom-input': (payload: FlInputCustomPayload) =>
    typeof payload.value === 'string' && typeof payload.length === 'number',
  /**
   * 开启 `debugMode` 后在 `custom-input` 之后触发，用于调试追踪。
   */
  'debug-event': (payload: FlInputDebugPayload) =>
    typeof payload.label === 'string' && typeof payload.value === 'string'
} as const

export type FlInputProps = ExtractPublicPropTypes<typeof flInputProps>
export type FlInputEmits = typeof flInputEmits

export type InputProps = FlInputProps
export type InputEmits = FlInputEmits
