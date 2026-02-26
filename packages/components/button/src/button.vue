<template>
  <component :is="h(ElButton, { ...mergedAttrs, ref: changeRef }, slots)" />
</template>

<script setup lang="ts">
import { ElButton } from 'element-plus'
import type { ComponentInstance } from 'vue'
import { h, useAttrs, useSlots } from 'vue'
import { useMergedAttrs, useMergedExpose } from '@falcon-ui/hooks'
import { flButtonEmits, flButtonProps } from './button'

defineOptions({
  name: 'FlButton',
  inheritAttrs: false
})

const props = defineProps(flButtonProps)
const emit = defineEmits(flButtonEmits)
const attrs = useAttrs()
const slots = useSlots()

const _myExpose = {
  /**
   * 标记该暴露值来源于 FlButton，便于调试识别。
   */
  debugKind: 'button'
}

const { changeRef } = useMergedExpose(_myExpose)
const { mergedAttrs } = useMergedAttrs({
  attrs: attrs as Record<string, unknown>,
  block: 'button',
  listenerName: 'onClick',
  onListener: () => {
    if (props.debugMode) {
      emit('debug-click', {
        label: props.debugLabel
      })
    }
  }
})

defineExpose({} as ComponentInstance<typeof ElButton> & typeof _myExpose)
</script>
