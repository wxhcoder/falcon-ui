<template>
  <button type="button" :class="[ns.b(), buttonClassList]" :disabled="isDisabled" @click="onClick">
    <span v-if="loading" :class="ns.e('loader')" aria-hidden="true"></span>
    <span :class="ns.e('content')">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNamespace } from '@falcon-ui/utils'
import { buttonEmits, buttonProps } from './button'

const props = defineProps(buttonProps)
const emit = defineEmits(buttonEmits)
const ns = useNamespace('button')

const isDisabled = computed(() => props.disabled || props.loading)

const buttonClassList = computed(() => [
  ns.m(props.type),
  ns.m(props.size),
  ns.is('disabled', props.disabled),
  ns.is('loading', props.loading)
])

const onClick = (event: MouseEvent) => {
  if (isDisabled.value) {
    return
  }

  emit('click', event)
}
</script>
