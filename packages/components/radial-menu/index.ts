import RadialMenu from './src/radial-menu.vue'
import { withInstall } from '@falcon-ui/utils'

export const FlRadialMenu = withInstall(RadialMenu as typeof RadialMenu & { name: string })

export default FlRadialMenu

export type {
  FlRadialMenuCloseReason,
  FlRadialMenuDropdownPlacement,
  FlRadialMenuEmits,
  FlRadialMenuExpose,
  FlRadialMenuItem,
  FlRadialMenuMode,
  FlRadialMenuMoreMode,
  FlRadialMenuOpenOptions,
  FlRadialMenuOpenReason,
  FlRadialMenuProps,
  FlRadialMenuSelectContext,
  FlRadialMenuTrigger,
  RadialMenuEmits,
  RadialMenuProps
} from './src/radial-menu'
