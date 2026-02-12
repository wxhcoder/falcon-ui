import type { ExtractPropTypes, PropType } from 'vue'

export const buttonTypes = ['default', 'primary', 'success', 'warning', 'danger'] as const
export type ButtonType = (typeof buttonTypes)[number]

export const buttonSizes = ['small', 'medium', 'large'] as const
export type ButtonSize = (typeof buttonSizes)[number]

export const buttonProps = {
  type: {
    type: String as PropType<ButtonType>,
    default: 'default'
  },
  size: {
    type: String as PropType<ButtonSize>,
    default: 'medium'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
} as const

export type ButtonProps = ExtractPropTypes<typeof buttonProps>

export const buttonEmits = {
  click: (_event: MouseEvent) => true
}

export type ButtonEmits = typeof buttonEmits
