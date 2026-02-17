import Button from './src/button.vue'
import { withInstall } from '@falcon-ui/utils'

export const FlButton = withInstall(Button)

export default FlButton

export type { ButtonEmits, ButtonProps, FlButtonEmits, FlButtonProps } from './src/button'
