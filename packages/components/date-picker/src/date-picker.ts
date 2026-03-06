import type { ExtractPublicPropTypes, PropType } from 'vue'

export type FlDatePickerValue = string | number | Date | string[] | number[] | Date[] | null

export const flDatePickerProps = {
  /**
   * Bound value. Keeps the wrapper on explicit v-model contract.
   */
  modelValue: {
    type: [String, Number, Date, Array] as PropType<FlDatePickerValue>,
    default: null
  },
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

export const flDatePickerEmits = {
  /**
   * Model value update event.
   */
  'update:modelValue': (_value: FlDatePickerValue) => true
} as const

export type FlDatePickerProps = ExtractPublicPropTypes<typeof flDatePickerProps>
export type FlDatePickerEmits = typeof flDatePickerEmits

export type DatePickerProps = FlDatePickerProps
export type DatePickerEmits = FlDatePickerEmits
