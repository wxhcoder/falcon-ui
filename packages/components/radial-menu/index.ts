import RadialMenu from './src/radial-menu.vue'
import RadialMenuItem from './src/radial-menu-item.vue'
import { withInstall } from '@falcon-ui/utils'

export const FlRadialMenu = withInstall(RadialMenu as typeof RadialMenu & { name: string })
export const FlRadialMenuItem = withInstall(
  RadialMenuItem as typeof RadialMenuItem & { name: string }
)

export default FlRadialMenu

export type {
  FlRadialMenuCloseReason,
  FlRadialMenuDropdownPlacement,
  FlRadialMenuEmits,
  FlRadialMenuExpose,
  FlRadialMenuItemData,
  FlRadialMenuItemType,
  FlRadialMenuMode,
  FlRadialMenuMoreMode,
  FlRadialMenuOpenOptions,
  FlRadialMenuOpenReason,
  FlRadialMenuProps,
  FlRadialMenuResolvableItem,
  FlRadialMenuResolvedItem,
  FlRadialMenuSelectContext,
  FlRadialMenuSize,
  FlRadialMenuTrigger,
  RadialMenuEmits,
  RadialMenuProps
} from './src/radial-menu'
