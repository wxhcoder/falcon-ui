import type { ExtractPublicPropTypes } from 'vue'

export const flDialogProps = {
  /**
   * 对话框主体区域固定高度，传入数字时按像素处理。
   */
  bodyHeight: {
    type: [Number, String] as [NumberConstructor, StringConstructor],
    default: undefined
  },
  /**
   * 是否禁用默认页脚中的取消按钮。
   */
  cancelDisabled: {
    type: Boolean,
    default: false
  },
  /**
   * 默认页脚取消按钮文案。
   */
  cancelText: {
    type: String,
    default: '取消'
  },
  /**
   * 是否禁用默认页脚中的确认按钮。
   */
  confirmDisabled: {
    type: Boolean,
    default: false
  },
  /**
   * 默认页脚确认按钮文案。
   */
  confirmText: {
    type: String,
    default: '确认'
  },
  /**
   * 通过 v-model 控制对话框显示状态。
   */
  modelValue: {
    type: Boolean,
    default: false
  },
  /**
   * 是否渲染默认页脚操作区。
   */
  showFooter: {
    type: Boolean,
    default: true
  }
} as const

export const flDialogEmits = {
  /**
   * 点击默认取消动作时触发。
   */
  cancel: () => true,
  /**
   * 点击默认确认动作时触发。
   */
  confirm: () => true,
  /**
   * 对话框显示状态变更时触发。
   */
  'update:modelValue': (value: boolean) => typeof value === 'boolean'
} as const

export type FlDialogProps = ExtractPublicPropTypes<typeof flDialogProps>
export type FlDialogEmits = typeof flDialogEmits

export type DialogProps = FlDialogProps
export type DialogEmits = FlDialogEmits
