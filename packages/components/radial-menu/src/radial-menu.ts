import type { ExtractPublicPropTypes, PropType } from 'vue'
import type {
  FlRadialMenuCloseReason,
  FlRadialMenuDropdownPlacement,
  FlRadialMenuItemData,
  FlRadialMenuItemType,
  FlRadialMenuMode,
  FlRadialMenuMoreMode,
  FlRadialMenuOpenReason,
  FlRadialMenuResolvedItem,
  FlRadialMenuSelectContext,
  FlRadialMenuSize,
  FlRadialMenuTrigger
} from './types'

const radialMenuSizes: FlRadialMenuSize[] = ['large', 'medium', 'small']
const radialMenuItemTypes: FlRadialMenuItemType[] = ['square', 'circle']

export const flRadialMenuProps = {
  items: {
    type: Array as PropType<FlRadialMenuItemData[]>,
    default: () => []
  },
  mode: {
    type: String as PropType<FlRadialMenuMode>,
    default: 'inline'
  },
  trigger: {
    type: String as PropType<FlRadialMenuTrigger>,
    default: 'click'
  },
  modelValue: {
    type: Boolean,
    default: undefined
  },
  shortcut: {
    type: String,
    default: ''
  },
  shortcutEnabled: {
    type: Boolean,
    default: true
  },
  centerIcon: {
    type: [Object, String] as PropType<FlRadialMenuItemData['icon']>,
    default: undefined
  },
  centerLabel: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  maxRingItems: {
    type: Number,
    default: 6
  },
  closeOnSelect: {
    type: Boolean,
    default: true
  },
  moreText: {
    type: String,
    default: 'More'
  },
  moreMode: {
    type: String as PropType<FlRadialMenuMoreMode>,
    default: 'text-ellipsis'
  },
  moreDropdownPlacement: {
    type: String as PropType<FlRadialMenuDropdownPlacement>,
    default: 'bottom'
  },
  size: {
    type: String as PropType<FlRadialMenuSize>,
    default: undefined,
    validator: (value: string) => radialMenuSizes.includes(value as FlRadialMenuSize)
  },
  itemType: {
    type: String as PropType<FlRadialMenuItemType>,
    default: 'square',
    validator: (value: string) => radialMenuItemTypes.includes(value as FlRadialMenuItemType)
  },
  teleport: {
    type: [Boolean, String] as unknown as PropType<boolean | string>,
    default: true
  },
  zIndex: {
    type: Number,
    default: 2000
  }
} as const

export const flRadialMenuEmits = {
  'update:modelValue': (opened: boolean) => typeof opened === 'boolean',
  open: (reason: FlRadialMenuOpenReason) => typeof reason === 'string',
  close: (reason: FlRadialMenuCloseReason) => typeof reason === 'string',
  select: (
    index: string,
    indexPath: string[],
    item: FlRadialMenuResolvedItem,
    context: FlRadialMenuSelectContext
  ) =>
    typeof index === 'string' &&
    Array.isArray(indexPath) &&
    indexPath.every((path) => typeof path === 'string') &&
    item !== undefined &&
    context !== undefined,
  'active-change': (item: FlRadialMenuResolvedItem | null) => item === null || item !== undefined,
  'more-open': () => true,
  'more-close': () => true
} as const

export type FlRadialMenuProps = ExtractPublicPropTypes<typeof flRadialMenuProps>
export type FlRadialMenuEmits = typeof flRadialMenuEmits
export type RadialMenuProps = FlRadialMenuProps
export type RadialMenuEmits = FlRadialMenuEmits

export type {
  FlRadialMenuCloseReason,
  FlRadialMenuDropdownPlacement,
  FlRadialMenuExpose,
  FlRadialMenuItemData,
  FlRadialMenuItemType,
  FlRadialMenuMode,
  FlRadialMenuMoreMode,
  FlRadialMenuOpenOptions,
  FlRadialMenuOpenReason,
  FlRadialMenuResolvableItem,
  FlRadialMenuResolvedItem,
  FlRadialMenuSelectContext,
  FlRadialMenuSize,
  FlRadialMenuTrigger
} from './types'
