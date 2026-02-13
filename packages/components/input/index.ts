import Input from './src/input.vue'
import { withInstall } from '@falcon-ui/utils'

export const FInput = withInstall(Input)

export default FInput

export type { FInputEmits, FInputProps, InputEmits, InputProps } from './src/input'
