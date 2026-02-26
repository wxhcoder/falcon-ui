<template>
  <component :is="h(ElInput, { ...mergedInputAttrs, ref: changeRef }, slots)" />
</template>

<script lang="ts" setup>
import { ElInput } from 'element-plus'
import type { ComponentInstance } from 'vue'
import { computed, h, useAttrs, useSlots, watch } from 'vue'
import { useMergedAttrs, useMergedExpose } from '@falcon-ui/hooks'
import { invokeListener } from '@falcon-ui/utils'
import { flInputEmits, flInputProps } from './input'

defineOptions({
  name: 'FlInput',
  inheritAttrs: false
})

const props = defineProps(flInputProps)
const emit = defineEmits(flInputEmits)
const attrs = useAttrs()
const slots = useSlots()
const rawAttrs = attrs as Record<string, unknown>

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
  attrs: rawAttrs,
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

const mergedInputAttrs = computed(() => ({
  ...mergedAttrs.value,
  class: [mergedAttrs.value.class, { 'is-error': props.isError, 'is-table': props.isTable }]
}))

const clearModelValue = () => {
  invokeListener(rawAttrs['onUpdate:modelValue'], '')
}

watch(
  () => props.isError,
  (isError, previousIsError) => {
    if (isError && previousIsError !== true) {
      clearModelValue()
    }
  },
  { immediate: true }
)

defineExpose({} as ComponentInstance<typeof ElInput> & typeof _myExpose)
</script>
