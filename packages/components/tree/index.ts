import { withInstall } from '@falcon-ui/utils'
import type { SFCWithInstall } from '@falcon-ui/utils'
import Tree from './src/tree.vue'

export const FlTree: SFCWithInstall<typeof Tree> = withInstall(Tree)

export default FlTree

export type {
  TreeClassNames,
  TreeClassValue,
  TreeCheckArgs,
  TreeCheckEvent,
  TreeCheckedKeys,
  TreeCheckedKeysObject,
  TreeData,
  TreeAllowDrag,
  TreeAllowDrop,
  TreeAllowDropType,
  TreeEmits,
  TreeExpandPayload,
  TreeIndex,
  TreeInteractionEvent,
  TreeKey,
  TreeLoadArgs,
  TreeLoadData,
  TreeLoadEvent,
  TreeNode,
  TreeNodeClickArgs,
  TreeNodeDragEndArgs,
  TreeNodeDragStartArgs,
  TreeNodeDragTargetArgs,
  TreeNodeDropArgs,
  TreeNodeDropType,
  TreeNodeInstance,
  TreeNodeModel,
  TreeNodeProps,
  TreeSelectArgs,
  TreeSelectEvent,
  TreeSwitcherLoadingIcon,
  TreeSwitcherIconMode,
  TreeNodeToggleArgs,
  TreeProps,
  TreeSemanticDOM,
  TreeSemanticRecord,
  TreeStyles
} from './src/tree'
