import Barcode from './src/barcode.vue'
import { withInstall } from '@falcon-ui/utils'

export const FlBarcode = withInstall(Barcode)

export default FlBarcode

export type {
  BarcodeProps,
  FlBarcodeFormat,
  FlBarcodeProps,
  FlBarcodeTextAlign,
  FlBarcodeTextPosition
} from './src/barcode'
