import Select from './src/select.vue'
import { withInstall } from '@falcon-ui/utils'
import type { SFCWithInstall } from '@falcon-ui/utils'

export const FlSelect: SFCWithInstall<typeof Select> = withInstall(Select)

export default FlSelect

export type {
  FlSelectEmits,
  FlSelectExpose,
  FlSelectProps,
  SelectEmits,
  SelectExpose,
  SelectProps
} from './src/select'
