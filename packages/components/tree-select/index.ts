import TreeSelect from './src/tree-select.vue'
import { withInstall } from '@falcon-ui/utils'
import type { SFCWithInstall } from '@falcon-ui/utils'

export const FlTreeSelect: SFCWithInstall<typeof TreeSelect> = withInstall(TreeSelect)

export default FlTreeSelect

export type { TreeSelectEmits, TreeSelectExpose, TreeSelectProps } from './src/tree-select'
