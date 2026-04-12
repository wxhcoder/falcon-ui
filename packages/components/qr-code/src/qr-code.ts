import type { ExtractPublicPropTypes, PropType } from 'vue'

export const flQrCodeErrorCorrectionLevels = ['L', 'M', 'Q', 'H'] as const

export type FlQrCodeErrorCorrectionLevel = (typeof flQrCodeErrorCorrectionLevels)[number]

export const flQrCodeTypes = ['canvas', 'svg'] as const

export type FlQrCodeType = (typeof flQrCodeTypes)[number]

export const flQrCodeProps = {
  /**
   * 需要编码到二维码中的字符串内容。
   */
  value: {
    type: String,
    default: ''
  },
  /**
   * 二维码外部显示尺寸，单位 px。
   */
  size: {
    type: Number,
    default: 100
  },
  /**
   * 深色模块颜色。
   */
  color: {
    type: String,
    default: '#000000'
  },
  /**
   * 浅色背景颜色。
   */
  backgroundColor: {
    type: String,
    default: '#ffffff'
  },
  /**
   * 二维码内容区域的内边距，单位 px。
   */
  padding: {
    type: Number,
    default: 12
  },
  /**
   * 容错等级。
   */
  errorCorrectionLevel: {
    type: String as PropType<FlQrCodeErrorCorrectionLevel>,
    default: 'M',
    validator: (value: string) =>
      flQrCodeErrorCorrectionLevels.includes(value as FlQrCodeErrorCorrectionLevel)
  },
  /**
   * 居中覆盖层图标地址。
   */
  iconSrc: {
    type: String,
    default: ''
  },
  /**
   * 居中覆盖层图标尺寸，单位 px。
   */
  iconSize: {
    type: Number,
    default: 24
  },
  /**
   * 图标底板背景色。
   */
  iconBackgroundColor: {
    type: String,
    default: '#ffffff'
  },
  /**
   * 图标底板圆角，单位 px。
   */
  iconBorderRadius: {
    type: Number,
    default: 4
  },
  /**
   * 输出方式。
   */
  type: {
    type: String as PropType<FlQrCodeType>,
    default: 'canvas',
    validator: (value: string) => flQrCodeTypes.includes(value as FlQrCodeType)
  }
} as const

export const flQrCodeEmits = {} as const

export type FlQrCodeProps = ExtractPublicPropTypes<typeof flQrCodeProps>
export type FlQrCodeEmits = typeof flQrCodeEmits

export type QrCodeProps = FlQrCodeProps
export type QrCodeEmits = FlQrCodeEmits
export type QrCodeErrorCorrectionLevel = FlQrCodeErrorCorrectionLevel
export type QrCodeType = FlQrCodeType
