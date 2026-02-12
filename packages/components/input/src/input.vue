<template>
  <div :class="[ns.b(), ns.is('disabled', disabled)]">
    <input
      :class="ns.e('inner')"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="onInput"
      @change="onChange" />
    <button
      v-if="showClear"
      type="button"
      :class="ns.e('clear')"
      aria-label="Clear input"
      @click="onClear">
      &times;
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNamespace } from '@falcon-ui/utils'
import { inputEmits, inputProps } from './input'

const props = defineProps(inputProps)
const emit = defineEmits(inputEmits)
const ns = useNamespace('input')

const showClear = computed(() => props.clearable && !props.disabled && props.modelValue.length > 0)

const onInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  emit('update:modelValue', value)
  emit('input', value)
}

const onChange = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  emit('change', value)
}

const onClear = () => {
  emit('update:modelValue', '')
  emit('input', '')
  emit('change', '')
}
</script>
