<template>
  <el-input
    ref="inputRef"
    :class="inputClass"
    :clearable="props.clearable"
    :disabled="props.disabled || isLoading"
    :model-value="innerLabel"
    :placeholder="props.placeholder"
    @blur="handleBlur"
    @clear="handleNativeClear"
    @keydown.enter.prevent="handleEnter"
    @update:model-value="handleInput">
    <template #suffix>
      <span
        :class="searchTriggerClass"
        aria-label="Search"
        role="button"
        tabindex="-1"
        @click="handleManualSearch"
        @mousedown.prevent>
        <el-icon :class="ns.is('loading', isLoading)">
          <Loading v-if="isLoading" />
          <Search v-else />
        </el-icon>
      </span>
    </template>
  </el-input>
</template>

<script lang="ts" setup>
import { Loading, Search } from '@element-plus/icons-vue'
import { ElIcon, ElInput } from 'element-plus'
import { computed, ref, watch } from 'vue'
import { useNamespace } from '@falcon-ui/utils'
import type { FlInputSearchMappedResult, FlInputSearchValue } from './input-search'
import { flInputSearchEmits, flInputSearchProps } from './input-search'

defineOptions({
  name: 'FlInputSearch',
  inheritAttrs: false
})

type ElInputExpose = {
  blur: () => void
  clear: () => void
  focus: () => void
}

const props = defineProps(flInputSearchProps)
const emit = defineEmits(flInputSearchEmits)
const ns = useNamespace('input-search')

const inputRef = ref<ElInputExpose | null>(null)
const innerLabel = ref(props.label)
const isLoading = ref(false)
const latestSearchToken = ref(0)
const lastValidLabel = ref(props.label)
const lastValidValue = ref<FlInputSearchValue>(props.modelValue)

const inputClass = computed(() => [
  ns.b(),
  {
    'is-error': props.isError,
    'is-table': props.isTable
  }
])

const searchTriggerClass = ns.e('trigger')

const normalizeLabel = (value: unknown): string => (typeof value === 'string' ? value : '')

const normalizeValue = (value: unknown): FlInputSearchValue => {
  if (value === null || typeof value === 'string' || typeof value === 'number') {
    return value
  }

  return null
}

const syncSnapshot = (value: FlInputSearchValue, label: string) => {
  lastValidValue.value = value
  lastValidLabel.value = label
}

const clearSelection = (reason: 'manual-empty' | 'blur-unconfirmed' | 'error') => {
  innerLabel.value = ''
  syncSnapshot(null, '')

  emit('update:modelValue', null)
  emit('update:label', '')
  emit('clear', { reason })
}

const commitSelection = (result: FlInputSearchMappedResult) => {
  const nextValue = normalizeValue(result.value)
  const nextLabel = normalizeLabel(result.label)

  innerLabel.value = nextLabel
  syncSnapshot(nextValue, nextLabel)

  emit('update:modelValue', nextValue)
  emit('update:label', nextLabel)
  emit('selection-commit', {
    value: nextValue,
    label: nextLabel,
    source: 'enter'
  })
}

const handleInput = (value: string) => {
  const nextLabel = normalizeLabel(value)
  innerLabel.value = nextLabel
  emit('update:label', nextLabel)
}

const handleManualSearch = () => {
  emit('openDialog', {
    keyword: innerLabel.value.trim(),
    reason: 'manual'
  })
}

const handleEnter = async () => {
  if (isLoading.value) {
    return
  }

  const keyword = innerLabel.value.trim()
  if (!keyword) {
    return
  }

  if (!props.fetchApi) {
    emit('openDialog', {
      keyword,
      reason: 'manual'
    })
    return
  }

  const currentToken = latestSearchToken.value + 1
  latestSearchToken.value = currentToken
  isLoading.value = true

  try {
    const response = await props.fetchApi(keyword)
    if (currentToken !== latestSearchToken.value) {
      return
    }

    const results = Array.isArray(response) ? response : []

    if (results.length === 1) {
      commitSelection(props.mapResult(results[0]))
      return
    }

    if (results.length > 1) {
      emit('openDialog', {
        keyword,
        reason: 'multi-match',
        results
      })
    }
  } catch (error) {
    if (currentToken !== latestSearchToken.value) {
      return
    }

    emit('search-error', {
      keyword,
      error
    })
  } finally {
    if (currentToken === latestSearchToken.value) {
      isLoading.value = false
    }
  }
}

const handleNativeClear = () => {
  clearSelection('manual-empty')
}

const handleBlur = () => {
  if (isLoading.value) {
    return
  }

  const currentLabel = innerLabel.value
  if (currentLabel === lastValidLabel.value) {
    return
  }

  if (!currentLabel) {
    clearSelection('manual-empty')
    return
  }

  if (props.clearOnBlurUnconfirmed) {
    clearSelection('blur-unconfirmed')
  }
}

const focus = () => {
  inputRef.value?.focus()
}

const blur = () => {
  inputRef.value?.blur()
}

const clear = () => {
  inputRef.value?.clear()
}

watch(
  () => props.label,
  (value) => {
    innerLabel.value = value
  }
)

watch(
  () => props.modelValue,
  (value) => {
    if (value === lastValidValue.value) {
      return
    }

    syncSnapshot(normalizeValue(value), props.label)
  }
)

watch(
  () => props.isError,
  (isError, previousIsError) => {
    if (isError && previousIsError !== true) {
      clearSelection('error')
    }
  },
  { immediate: true }
)

defineExpose({
  focus,
  blur,
  clear
})
</script>
