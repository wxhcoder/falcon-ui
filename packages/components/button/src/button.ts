import type { ExtractPublicPropTypes } from 'vue'

export const flButtonProps = {
  /**
   * 调试事件标签，在开启调试模式后会随 `debug-click` 一起抛出。
   */
  debugLabel: {
    type: String,
    default: ''
  },
  /**
   * 是否开启调试点击事件，开启后每次点击都会触发 `debug-click`。
   */
  debugMode: {
    type: Boolean,
    default: false
  }
} as const

export interface FlButtonDebugPayload {
  /**
   * 用于标识当前按钮实例的业务标签。
   */
  label: string
}

export const flButtonEmits = {
  /**
   * 开启调试模式后，在按钮点击时触发。
   */
  'debug-click': (payload: FlButtonDebugPayload) => typeof payload.label === 'string'
} as const

export type FlButtonProps = ExtractPublicPropTypes<typeof flButtonProps>
export type FlButtonEmits = typeof flButtonEmits

export type ButtonProps = FlButtonProps
export type ButtonEmits = FlButtonEmits
