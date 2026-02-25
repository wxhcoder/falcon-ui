import type { ExtractPublicPropTypes } from 'vue'

export const flDialogProps = {
  bodyHeight: {
    type: [Number, String] as [NumberConstructor, StringConstructor],
    default: undefined
  },
  cancelDisabled: {
    type: Boolean,
    default: false
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  confirmDisabled: {
    type: Boolean,
    default: false
  },
  confirmText: {
    type: String,
    default: '确认'
  },
  modelValue: {
    type: Boolean,
    default: false
  },
  showFooter: {
    type: Boolean,
    default: true
  }
} as const

export const flDialogEmits = {
  cancel: () => true,
  confirm: () => true,
  'update:modelValue': (value: boolean) => typeof value === 'boolean'
} as const

export type FlDialogProps = ExtractPublicPropTypes<typeof flDialogProps>
export type FlDialogEmits = typeof flDialogEmits

export type DialogProps = FlDialogProps
export type DialogEmits = FlDialogEmits
