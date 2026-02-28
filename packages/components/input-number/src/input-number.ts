import type { ExtractPublicPropTypes, PropType } from 'vue'

export const flInputNumberPrecisionModes = ['ROUND', 'FIXED', 'STRICT'] as const

export type FlInputNumberPrecisionMode = (typeof flInputNumberPrecisionModes)[number]

export const flInputNumberProps = {
  /**
   * 绑定值，仅输出 number 或 null。
   */
  modelValue: {
    type: [Number, String] as PropType<number | string | null>,
    default: null
  },
  /**
   * 是否用于表格单元格内输入场景。
   */
  isTable: {
    type: Boolean,
    default: false
  },
  /**
   * 是否进入错误态。开启后会触发错误样式并清空输入值。
   */
  isError: {
    type: Boolean,
    default: false
  },
  /**
   * 小数精度位数。
   */
  precision: {
    type: Number,
    default: 2
  },
  /**
   * 精度处理模式：ROUND(四舍五入) / FIXED(截断) / STRICT(严格)。
   */
  precisionMode: {
    type: String as PropType<FlInputNumberPrecisionMode>,
    default: 'ROUND',
    validator: (value: string) =>
      flInputNumberPrecisionModes.includes(value as FlInputNumberPrecisionMode)
  },
  /**
   * 是否开启格式化显示。
   */
  isFormat: {
    type: Boolean,
    default: false
  },
  /**
   * 严格模式下精度不匹配时的 placeholder 提示。
   */
  strictErrorPlaceholder: {
    type: String,
    default: '精度不对'
  }
} as const

export interface FlInputNumberCustomPayload {
  /**
   * 输入框当前原始字符串值（经字符过滤后）。
   */
  rawValue: string
  /**
   * 归一化后的数值，无法解析时为 null。
   */
  value: number | null
}

export interface FlInputNumberStrictErrorPayload {
  /**
   * 严格模式校验失败时的原始输入值。
   */
  rawValue: string
  /**
   * 允许精度。
   */
  precision: number
  /**
   * 实际小数位长度。
   */
  actualPrecision: number
}

export const flInputNumberEmits = {
  /**
   * modelValue 更新，仅输出 number 或 null。
   */
  'update:modelValue': (value: number | null) => value === null || typeof value === 'number',
  /**
   * 严格模式触发错误时同步错误态。
   */
  'update:isError': (value: boolean) => typeof value === 'boolean',
  /**
   * 每次输入后触发，携带归一化结果。
   */
  'custom-input': (payload: FlInputNumberCustomPayload) =>
    typeof payload.rawValue === 'string' &&
    (payload.value === null || typeof payload.value === 'number'),
  /**
   * 严格模式下精度超限时触发。
   */
  'strict-error': (payload: FlInputNumberStrictErrorPayload) =>
    typeof payload.rawValue === 'string' &&
    typeof payload.precision === 'number' &&
    typeof payload.actualPrecision === 'number'
} as const

export type FlInputNumberProps = ExtractPublicPropTypes<typeof flInputNumberProps>
export type FlInputNumberEmits = typeof flInputNumberEmits

export type InputNumberProps = FlInputNumberProps
export type InputNumberEmits = FlInputNumberEmits
