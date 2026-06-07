import type { Component, ExtractPublicPropTypes, PropType } from 'vue'

export const flRadialMenuItemProps = {
  index: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  icon: {
    type: [Object, Function] as PropType<Component>,
    default: undefined
  },
  shortcut: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  hidden: {
    type: Boolean,
    default: false
  },
  divided: {
    type: Boolean,
    default: false
  },
  closeOnSelect: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined
  },
  meta: {
    type: Object as PropType<Record<string, unknown>>,
    default: undefined
  }
} as const

export type FlRadialMenuItemProps = ExtractPublicPropTypes<typeof flRadialMenuItemProps>
