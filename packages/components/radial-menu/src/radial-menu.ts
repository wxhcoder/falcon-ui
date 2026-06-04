import type { ExtractPublicPropTypes, PropType } from 'vue'
import type {
  FlRadialMenuCloseReason,
  FlRadialMenuDropdownPlacement,
  FlRadialMenuItem,
  FlRadialMenuItemType,
  FlRadialMenuMode,
  FlRadialMenuMoreMode,
  FlRadialMenuOpenReason,
  FlRadialMenuSelectContext,
  FlRadialMenuSize,
  FlRadialMenuTrigger
} from './types'

export const radialMenuSizePresets: Record<
  FlRadialMenuSize,
  { radius: number; centerSize: number; itemSize: number }
> = {
  large: {
    radius: 96,
    centerSize: 56,
    itemSize: 44
  },
  medium: {
    radius: 80,
    centerSize: 48,
    itemSize: 36
  },
  small: {
    radius: 64,
    centerSize: 40,
    itemSize: 32
  }
}

const radialMenuSizes = Object.keys(radialMenuSizePresets) as FlRadialMenuSize[]
const radialMenuItemTypes: FlRadialMenuItemType[] = ['square', 'circle']

export const flRadialMenuProps = {
  items: {
    type: Array as PropType<FlRadialMenuItem[]>,
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
    type: [Object, String] as PropType<FlRadialMenuItem['icon']>,
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
    default: 'large',
    validator: (value: string) => radialMenuSizes.includes(value as FlRadialMenuSize)
  },
  radius: {
    type: Number
  },
  centerSize: {
    type: Number
  },
  itemSize: {
    type: Number
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
  select: (item: FlRadialMenuItem, context: FlRadialMenuSelectContext) =>
    item !== undefined && context !== undefined,
  'active-change': (item: FlRadialMenuItem | null) => item === null || item !== undefined,
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
  FlRadialMenuItem,
  FlRadialMenuItemType,
  FlRadialMenuMode,
  FlRadialMenuMoreMode,
  FlRadialMenuOpenOptions,
  FlRadialMenuOpenReason,
  FlRadialMenuSelectContext,
  FlRadialMenuSize,
  FlRadialMenuTrigger
} from './types'
