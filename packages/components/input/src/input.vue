<template>
  <component :is="h(ElInput, { ...mergedAttrs, ref: changeRef }, slots)" />
</template>

<script lang="ts" setup>
import { ElInput } from 'element-plus'
import type { ComponentInstance } from 'vue'
import { computed, getCurrentInstance, h, useAttrs, useSlots } from 'vue'
import { invokeListener, mergeComponentExpose } from '@falcon-ui/utils'
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

const vm = getCurrentInstance()

function changeRef(exposed: unknown) {
  mergeComponentExpose(vm, exposed, _myExpose)
}

const mergedAttrs = computed(() => {
  const next = { ...(attrs as Record<string, unknown>) }
  const attrInputListener = next.onInput
  next.class = ['fl-input', next.class]

  next.onInput = (...args: unknown[]) => {
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

    invokeListener(attrInputListener, ...args)
  }

  return next
})

defineExpose({} as ComponentInstance<typeof ElInput> & typeof _myExpose)
</script>
