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
  TreeFilterTreeNode,
  TreeAllowDrag,
  TreeAllowDrop,
  TreeAllowDropType,
  TreeEmits,
  TreeExpandEvent,
  TreeExpose,
  TreeIndex,
  TreeInteractionEvent,
  TreeKey,
  TreeLoadArgs,
  TreeLoadData,
  TreeLoadEvent,
  TreeNode,
  TreeNodeClickArgs,
  TreeNodeClassName,
  TreeNodeClassNameInfo,
  TreeNodeDblclickArgs,
  TreeNodeDragEndArgs,
  TreeNodeDragStartArgs,
  TreeNodeDragTargetArgs,
  TreeNodeDropArgs,
  TreeNodeDropType,
  TreeExpandedNode,
  TreeNodeRightClickArgs,
  TreeNodeInstance,
  TreeNodeModel,
  TreeNodeProps,
  TreeSelectArgs,
  TreeSelectEvent,
  TreeSwitcherLoadingIcon,
  TreeSwitcherIconMode,
  TreeNodeToggleArgs,
  TreeProps,
  TreeScrollAlign,
  TreeScrollToOptions,
  TreeSemanticDOM,
  TreeSemanticRecord,
  TreeShowLine,
  TreeShowLineOptions,
  TreeStyles
} from './src/tree'
