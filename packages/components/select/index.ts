import Select from './src/select.vue'
import { withInstall } from '@falcon-ui/utils'

export const FlSelect = withInstall(Select)

export default FlSelect

export type { FlSelectEmits, FlSelectProps, SelectEmits, SelectProps } from './src/select'
