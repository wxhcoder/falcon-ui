import type { ExtractPublicPropTypes, PropType } from 'vue'

export const flBarcodeFormats = ['CODE128', 'CODE39', 'EAN13', 'EAN8', 'UPCA', 'UPCE'] as const

export type FlBarcodeFormat = (typeof flBarcodeFormats)[number]

export const flBarcodeTextAligns = ['left', 'center', 'right'] as const

export type FlBarcodeTextAlign = (typeof flBarcodeTextAligns)[number]

export const flBarcodeTextPositions = ['top', 'bottom'] as const

export type FlBarcodeTextPosition = (typeof flBarcodeTextPositions)[number]

export const flBarcodeProps = {
  /**
   * Barcode payload.
   */
  value: {
    type: String,
    default: ''
  },
  /**
   * Supported barcode format.
   */
  format: {
    type: String as PropType<FlBarcodeFormat>,
    default: 'CODE128',
    validator: (value: string) => flBarcodeFormats.includes(value as FlBarcodeFormat)
  },
  /**
   * Width of each bar.
   */
  width: {
    type: Number,
    default: 2
  },
  /**
   * Barcode height.
   */
  height: {
    type: Number,
    default: 100
  },
  /**
   * Bar color.
   */
  color: {
    type: String,
    default: '#000000'
  },
  /**
   * Background color.
   */
  backgroundColor: {
    type: String,
    default: '#ffffff'
  },
  /**
   * Whether to display readable text.
   */
  displayValue: {
    type: Boolean,
    default: true
  },
  /**
   * Custom text. Falls back to value when empty.
   */
  text: {
    type: String,
    default: ''
  },
  /**
   * Text font family.
   */
  font: {
    type: String,
    default: 'monospace'
  },
  /**
   * Text font style flags.
   */
  fontOptions: {
    type: String,
    default: ''
  },
  /**
   * Text font size.
   */
  fontSize: {
    type: Number,
    default: 20
  },
  /**
   * Text alignment.
   */
  textAlign: {
    type: String as PropType<FlBarcodeTextAlign>,
    default: 'center',
    validator: (value: string) => flBarcodeTextAligns.includes(value as FlBarcodeTextAlign)
  },
  /**
   * Text position.
   */
  textPosition: {
    type: String as PropType<FlBarcodeTextPosition>,
    default: 'bottom',
    validator: (value: string) => flBarcodeTextPositions.includes(value as FlBarcodeTextPosition)
  },
  /**
   * Distance between barcode bars and text.
   */
  textMargin: {
    type: Number,
    default: 2
  },
  /**
   * Global margin around the barcode.
   */
  margin: {
    type: Number,
    default: 10
  },
  /**
   * Overrides the top margin when provided.
   */
  marginTop: {
    type: Number,
    default: undefined
  },
  /**
   * Overrides the right margin when provided.
   */
  marginRight: {
    type: Number,
    default: undefined
  },
  /**
   * Overrides the bottom margin when provided.
   */
  marginBottom: {
    type: Number,
    default: undefined
  },
  /**
   * Overrides the left margin when provided.
   */
  marginLeft: {
    type: Number,
    default: undefined
  }
} as const

export type FlBarcodeProps = ExtractPublicPropTypes<typeof flBarcodeProps>

export type BarcodeProps = FlBarcodeProps
