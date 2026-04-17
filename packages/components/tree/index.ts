import { withInstall } from '@falcon-ui/utils'
import type { SFCWithInstall } from '@falcon-ui/utils'
import Tree from './src/tree.vue'

export const FlTree: SFCWithInstall<typeof Tree> = withInstall(Tree)

export default FlTree

export type {
  FlTreeClassNames,
  FlTreeClassValue,
  FlTreeIndex,
  FlTreeKey,
  FlTreeNodePropsConfig,
  FlTreeNormalizedNode,
  FlTreeProps,
  FlTreeRawNode,
  FlTreeSemanticDOM,
  FlTreeSemanticRecord,
  FlTreeStyles
} from './src/tree'
