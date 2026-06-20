import type { ExtractPublicPropTypes } from 'vue'
import type { TreeSelectInstance } from 'element-plus'

export const treeSelectProps = {
  /**
   * 是否进入错误态。
   */
  isError: {
    type: Boolean,
    default: false
  },
  /**
   * 是否用于表格单元格内树选择场景。
   */
  isTable: {
    type: Boolean,
    default: false
  }
} as const

export const treeSelectEmits = {} as const

export type TreeSelectProps = ExtractPublicPropTypes<typeof treeSelectProps>
export type TreeSelectEmits = typeof treeSelectEmits
export interface TreeSelectExpose extends TreeSelectInstance {
  focus: () => void
  blur: () => void
  selectedLabel?: string | string[]
}
