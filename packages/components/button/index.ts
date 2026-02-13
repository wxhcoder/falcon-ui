import Button from './src/button.vue'
import { withInstall } from '@falcon-ui/utils'

export const FButton = withInstall(Button)

export default FButton

export type { ButtonEmits, ButtonProps, FButtonEmits, FButtonProps } from './src/button'
