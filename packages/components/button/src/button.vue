<template>
  <component :is="h(ElButton, { ...mergedAttrs, ref: changeRef }, slots)" />
</template>

<script setup lang="ts">
import { ElButton } from 'element-plus'
import type { ComponentInstance } from 'vue'
import { computed, getCurrentInstance, h, useAttrs, useSlots } from 'vue'
import { invokeListener, mergeComponentExpose } from '@falcon-ui/utils'
import { flButtonEmits, flButtonProps } from './button'

defineOptions({
  name: 'FlButton',
  inheritAttrs: false
})

const props = defineProps(flButtonProps)
const emit = defineEmits(flButtonEmits)
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
  next.class = ['fl-button', next.class]

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
