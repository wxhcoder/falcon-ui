import InputNumber from './src/input-number.vue'
import { withInstall } from '@falcon-ui/utils'

export const FlInputNumber = withInstall(InputNumber)

export default FlInputNumber

export type {
  FlInputNumberCustomPayload,
  FlInputNumberEmits,
  FlInputNumberPrecisionMode,
  FlInputNumberProps,
  FlInputNumberStrictErrorPayload,
  InputNumberEmits,
  InputNumberProps
} from './src/input-number'
