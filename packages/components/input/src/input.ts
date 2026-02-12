import type { ExtractPropTypes } from 'vue'

export const inputProps = {
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  clearable: {
    type: Boolean,
    default: false
  }
} as const

export type InputProps = ExtractPropTypes<typeof inputProps>

export const inputEmits = {
  'update:modelValue': (_value: string) => true,
  input: (_value: string) => true,
  change: (_value: string) => true
}

export type InputEmits = typeof inputEmits
