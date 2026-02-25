import Dialog from './src/dialog.vue'
import { withInstall } from '@falcon-ui/utils'

export const FlDialog = withInstall(Dialog)

export default FlDialog

export type { DialogEmits, DialogProps, FlDialogEmits, FlDialogProps } from './src/dialog'
