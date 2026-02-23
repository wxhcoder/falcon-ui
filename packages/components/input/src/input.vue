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
  myMethod() {
    console.log('my method!')
  },
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
