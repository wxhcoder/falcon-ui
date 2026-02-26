<template>
  <section class="vp-demo">
    <div class="vp-demo__preview">
      <div class="vp-demo__raw vp-raw">
        <component :is="demoComponent" v-if="demoComponent" />
        <slot v-else />
      </div>
    </div>

    <div class="vp-demo__toolbar">
      <span class="vp-demo__path">{{ sourcePath }}</span>
      <div class="vp-demo__actions">
        <button
          type="button"
          class="vp-demo__action"
          :aria-label="copied ? '已复制' : '复制代码'"
          :title="copied ? '已复制' : '复制代码'"
          @click="copyCode">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M16 1H6a2 2 0 0 0-2 2v12h2V3h10V1zm3 4H10a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H10V7h9v14z" />
          </svg>
        </button>
        <button
          type="button"
          class="vp-demo__action"
          :aria-label="expanded ? '收起代码' : '查看代码'"
          :title="expanded ? '收起代码' : '查看代码'"
          @click="toggleExpanded">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
          </svg>
        </button>
      </div>
    </div>

    <Transition name="vp-demo-fade">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-show="expanded" class="vp-demo__source" v-html="decodedHighlightedCode" />
    </Transition>

    <div class="vp-demo__footer">
      <button
        type="button"
        class="vp-demo__collapse"
        :aria-label="expanded ? '收起面板' : '展开代码'"
        :title="expanded ? '收起面板' : '展开代码'"
        @click="toggleExpanded">
        <span>{{ expanded ? '收起面板' : '展开代码' }}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true" :class="{ 'is-expanded': expanded }">
          <path d="m12 15.4-6-6L7.4 8l4.6 4.6L16.6 8 18 9.4l-6 6z" />
        </svg>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    demoComponent?: string
    highlightedCode: string
    sourceCode: string
    sourcePath: string
  }>(),
  {
    demoComponent: ''
  }
)

const expanded = ref(false)
const copied = ref(false)

const decodeBase64 = (value: string) => {
  const runtimeBuffer = (
    globalThis as {
      Buffer?: {
        from: (
          input: string,
          encoding: 'base64'
        ) => {
          toString: (encoding: 'utf8') => string
        }
      }
    }
  ).Buffer
  if (runtimeBuffer) {
    return runtimeBuffer.from(value, 'base64').toString('utf8')
  }

  if (typeof atob === 'function') {
    const binary = atob(value)
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  }

  return value
}

const decodedSourceCode = computed(() => decodeBase64(props.sourceCode))
const decodedHighlightedCode = computed(() => decodeBase64(props.highlightedCode))

const toggleExpanded = () => {
  expanded.value = !expanded.value
}

const copyCode = async () => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(decodedSourceCode.value)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = decodedSourceCode.value
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    copied.value = true
    window.setTimeout(() => {
      copied.value = false
    }, 1600)
  } catch {
    copied.value = false
  }
}
</script>

<style scoped>
.vp-demo {
  margin: 14px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}

.vp-demo__preview {
  padding: 16px;
  background: var(--vp-c-bg);
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.vp-demo__raw {
  width: 100%;
}

.vp-demo__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 20px;
  border-top: 1px solid var(--vp-c-divider);
}

.vp-demo__path {
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.vp-demo__actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.vp-demo__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.vp-demo__action:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.vp-demo__action svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.vp-demo__source {
  padding: 0 20px 12px;
  overflow-x: auto;
  overflow-y: hidden;
  max-width: 100%;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
}

.vp-demo__source :deep(pre) {
  margin: 0;
  border-radius: 8px;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: auto;
}

.vp-demo__footer {
  border-top: 1px solid var(--vp-c-divider);
  padding: 0 20px;
}

.vp-demo__collapse {
  width: 100%;
  height: 38px;
  border: 0;
  background: transparent;
  color: var(--vp-c-text-2);
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.vp-demo__collapse:hover {
  color: var(--vp-c-brand-1);
}

.vp-demo__collapse svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
  transition: transform 0.2s ease;
}

.vp-demo__collapse svg.is-expanded {
  transform: rotate(180deg);
}

.vp-demo-fade-enter-active,
.vp-demo-fade-leave-active {
  transition: opacity 0.2s ease;
}

.vp-demo-fade-enter-from,
.vp-demo-fade-leave-to {
  opacity: 0;
}
</style>
