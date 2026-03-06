import type { ExtractPublicPropTypes } from 'vue'

export const flDatePickerProps = {
  /**
   * Whether the component is in error state.
   */
  isError: {
    type: Boolean,
    default: false
  },
  /**
   * Whether the component is used in a table-cell context.
   */
  isTable: {
    type: Boolean,
    default: false
  }
} as const

export const flDatePickerEmits = {} as const

export type FlDatePickerProps = ExtractPublicPropTypes<typeof flDatePickerProps>
export type FlDatePickerEmits = typeof flDatePickerEmits

export type DatePickerProps = FlDatePickerProps
export type DatePickerEmits = FlDatePickerEmits

