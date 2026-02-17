import Input from './src/input.vue'
import { withInstall } from '@falcon-ui/utils'

export const FlInput = withInstall(Input)

export default FlInput

export type { FlInputEmits, FlInputProps, InputEmits, InputProps } from './src/input'
