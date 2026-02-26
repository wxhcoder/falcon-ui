<template>
  <component :is="h(ElInput, { ...mergedAttrs, ref: changeRef }, slots)" />
</template>

<script lang="ts" setup>
import { ElInput } from 'element-plus'
import type { ComponentInstance } from 'vue'
import { h, useAttrs, useSlots } from 'vue'
import { useMergedAttrs, useMergedExpose } from '@falcon-ui/hooks'
import { flInputEmits, flInputProps } from './input'

defineOptions({
  name: 'FlInput',
  inheritAttrs: false
})

const props = defineProps(flInputProps)
const emit = defineEmits(flInputEmits)
const attrs = useAttrs()
const slots = useSlots()

// Keep user-defined exposed capabilities and merge with ElInput expose.
const _myExpose = {
  /**
   * FlInput 额外暴露的示例方法，可用于联调验证。
   */
  myMethod() {
    console.log('my method!')
  },
  /**
   * FlInput 额外暴露的示例数值，用于文档演示与调试。
   */
  myValue: 123
}

const { changeRef } = useMergedExpose(_myExpose)
const { mergedAttrs } = useMergedAttrs({
  attrs: attrs as Record<string, unknown>,
  block: 'input',
  listenerName: 'onInput',
  onListener: (...args: unknown[]) => {
    const value = args[0]
    if (typeof value === 'string') {
      emit('custom-input', {
        value,
        length: value.length
      })

      if (props.debugMode) {
        emit('debug-event', {
          label: props.debugLabel,
          value
        })
      }
    }
  }
})

defineExpose({} as ComponentInstance<typeof ElInput> & typeof _myExpose)
</script>
