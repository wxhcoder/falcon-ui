import type { ExtractPublicPropTypes } from 'vue'

export const flSelectProps = {
  /**
   * 是否进入错误态。
   */
  isError: {
    type: Boolean,
    default: false
  },
  /**
   * 是否用于表格单元格内选择场景。
   */
  isTable: {
    type: Boolean,
    default: false
  }
} as const

export const flSelectEmits = {} as const

export type FlSelectProps = ExtractPublicPropTypes<typeof flSelectProps>
export type FlSelectEmits = typeof flSelectEmits

export type SelectProps = FlSelectProps
export type SelectEmits = FlSelectEmits
