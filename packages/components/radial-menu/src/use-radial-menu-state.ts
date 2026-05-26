import { computed, ref, type Ref } from 'vue'
import type { FlRadialMenuCloseReason, FlRadialMenuOpenOptions } from './types'

export interface UseRadialMenuStateOptions {
  modelValue: Ref<boolean | undefined>
  disabled: Ref<boolean>
  emitUpdate: (opened: boolean) => void
}

export const useRadialMenuState = ({
  modelValue,
  disabled,
  emitUpdate
}: UseRadialMenuStateOptions) => {
  const uncontrolledOpened = ref(false)
  const floatingX = ref<number | undefined>()
  const floatingY = ref<number | undefined>()
  const isControlled = computed(() => modelValue.value !== undefined)
  const opened = computed(() =>
    isControlled.value ? modelValue.value === true : uncontrolledOpened.value
  )

  const setOpened = (nextOpened: boolean) => {
    if (disabled.value && nextOpened) {
      return
    }

    if (!isControlled.value) {
      uncontrolledOpened.value = nextOpened
    }

    emitUpdate(nextOpened)
  }

  const open = (options: FlRadialMenuOpenOptions = {}) => {
    if (options.x !== undefined) {
      floatingX.value = options.x
    }

    if (options.y !== undefined) {
      floatingY.value = options.y
    }

    setOpened(true)
  }

  const close = (_reason: FlRadialMenuCloseReason = 'manual') => {
    setOpened(false)
  }

  const toggle = (options: FlRadialMenuOpenOptions = {}) => {
    if (opened.value) {
      close('manual')
    } else {
      open(options)
    }
  }

  return {
    opened,
    floatingX,
    floatingY,
    open,
    close,
    toggle
  }
}
