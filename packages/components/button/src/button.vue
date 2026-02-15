<template>
  <component :is="h(ElButton, { ...mergedAttrs, ref: changeRef }, slots)" />
</template>

<script setup lang="ts">
import { ElButton } from 'element-plus'
import type { ComponentInstance } from 'vue'
import { computed, getCurrentInstance, h, useAttrs, useSlots } from 'vue'
import { invokeListener, mergeComponentExpose } from '@falcon-ui/utils'
import { fButtonEmits, fButtonProps } from './button'

defineOptions({
  name: 'FButton',
  inheritAttrs: false
})

const props = defineProps(fButtonProps)
const emit = defineEmits(fButtonEmits)
const attrs = useAttrs()
const slots = useSlots()
const vm = getCurrentInstance()

const _myExpose = {
  debugKind: 'button'
}

const changeRef = (exposed: unknown) => {
  mergeComponentExpose(vm, exposed, _myExpose)
}

const mergedAttrs = computed(() => {
  const next = { ...(attrs as Record<string, unknown>) }
  const attrClickListener = next.onClick
  next.class = ['f-button', next.class]

  next.onClick = (...args: unknown[]) => {
    if (props.debugMode) {
      emit('debug-click', {
        label: props.debugLabel
      })
    }

    invokeListener(attrClickListener, ...args)
    const a = '1'
    console.log(a)
  }

  return next
})

defineExpose({} as ComponentInstance<typeof ElButton> & typeof _myExpose)
</script>
