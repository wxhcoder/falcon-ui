import type { ExtractPublicPropTypes, PropType } from 'vue'
import type {
  FlRadialMenuCloseReason,
  FlRadialMenuDropdownPlacement,
  FlRadialMenuItem,
  FlRadialMenuMode,
  FlRadialMenuMoreMode,
  FlRadialMenuOpenReason,
  FlRadialMenuSelectContext,
  FlRadialMenuTrigger
} from './types'

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
  radius: {
    type: Number,
    default: 96
  },
  centerSize: {
    type: Number,
    default: 56
  },
  itemSize: {
    type: Number,
    default: 44
  },
  teleport: {
    type: [Boolean, String],
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
  FlRadialMenuMode,
  FlRadialMenuMoreMode,
  FlRadialMenuOpenOptions,
  FlRadialMenuOpenReason,
  FlRadialMenuSelectContext,
  FlRadialMenuTrigger
} from './types'
