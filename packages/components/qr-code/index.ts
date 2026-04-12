import { withInstall } from '@falcon-ui/utils'
import QrCode from './src/qr-code.vue'

export const FlQrCode = withInstall(QrCode)

export default FlQrCode

export type {
  FlQrCodeEmits,
  FlQrCodeErrorCorrectionLevel,
  FlQrCodeProps,
  FlQrCodeType,
  QrCodeEmits,
  QrCodeErrorCorrectionLevel,
  QrCodeProps,
  QrCodeType
} from './src/qr-code'
