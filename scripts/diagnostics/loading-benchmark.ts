/* eslint-disable vue/one-component-per-file -- Isolated benchmark fixtures create and destroy separate Vue apps to measure resource cleanup. */
import { createApp, defineComponent, h, nextTick, ref, withDirectives } from 'vue'
import { ElLoading, configProviderContextKey } from 'element-plus'
import FlLoading from '../../packages/components/loading/src/FlLoading.vue'
import { useFlLoading } from '../../packages/components/loading/src/use-fl-loading'
import '../../packages/theme/src/loading.scss'
import './loading-namespace.scss'

// Only this diagnostic page instruments rAF. The published component has no diagnostic hooks.
const nativeRequest = window.requestAnimationFrame.bind(window)
const nativeCancel = window.cancelAnimationFrame.bind(window)
const pendingFrames = new Set<number>()
const costs = new Map<number, number>()
let measuring = false
window.requestAnimationFrame = (callback) => {
  const id = nativeRequest((timestamp) => {
    pendingFrames.delete(id)
    const before = performance.now()
    callback(timestamp)
    if (measuring) costs.set(timestamp, (costs.get(timestamp) || 0) + performance.now() - before)
  })
  pendingFrames.add(id)
  return id
}
window.cancelAnimationFrame = (id) => {
  pendingFrames.delete(id)
  nativeCancel(id)
}
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))
const result = ref('Ready')
const busy = ref(false)
const root = ref<HTMLElement>()
const measure = async () => {
  busy.value = true
  result.value = 'Running 10 Earth indicators for 30 seconds…'
  const active = ref(true)
  const app = createApp({
    setup: () => () =>
      h(
        'div',
        { style: 'display:flex;gap:16px;flex-wrap:wrap' },
        Array.from({ length: 10 }, (_, i) =>
          h(FlLoading, { key: i, animation: 'earth', size: 64, active: active.value })
        )
      )
  })
  app.mount(root.value!)
  await delay(1000)
  costs.clear()
  measuring = true
  const started = performance.now()
  await delay(30000)
  measuring = false
  const duration = performance.now() - started
  active.value = false
  await nextTick()
  await delay(100)
  const inactiveCallbacks = pendingFrames.size
  app.unmount()
  await delay(100)
  const values = [...costs.values()].sort((a, b) => a - b)
  result.value = JSON.stringify(
    {
      test: '10 Earth / 64px / 30s',
      durationMs: duration,
      frames: values.length,
      p95Ms: values[Math.floor(values.length * 0.95)],
      meanMs: values.reduce((a, b) => a + b, 0) / values.length,
      inactiveCallbacks,
      unmountedCallbacks: pendingFrames.size,
      remainingCanvases: root.value!.querySelectorAll('canvas').length,
      dpr: devicePixelRatio,
      userAgent: navigator.userAgent,
      cpuThreads: navigator.hardwareConcurrency
    },
    null,
    2
  )
  busy.value = false
}
const stress = async () => {
  busy.value = true
  const active = ref(false)
  const Content = defineComponent({
    setup() {
      const loading = useFlLoading(active, {
        animation: 'earth',
        text: 'Namespace QA',
        theme: 'light',
        background: '#eef4fa'
      })
      return () =>
        withDirectives(h('section', { style: 'height:200px;position:relative' }, 'Namespace qa'), [
          [ElLoading.directive, loading.value]
        ])
    }
  })
  const app = createApp(Content)
  app.provide(configProviderContextKey, ref({ namespace: 'qa' }))
  app.use(ElLoading)
  app.mount(root.value!)
  active.value = true
  await nextTick()
  await delay(100)
  const mask = document.querySelector('.qa-loading-mask.fl-loading-adapter')!
  const svg = mask?.querySelector('svg')
  const bounds = mask?.getBoundingClientRect()
  const spinner = mask?.firstElementChild?.getBoundingClientRect()
  const namespace = {
    className: mask?.className,
    svgDisplay: svg && getComputedStyle(svg).display,
    centerError:
      bounds && spinner
        ? Math.abs(bounds.y + bounds.height / 2 - spinner.y - spinner.height / 2)
        : null
  }
  result.value = 'Inspecting custom namespace…'
  await delay(2000)
  for (let i = 0; i < 100; i++) {
    active.value = false
    await nextTick()
    await delay(10)
    active.value = true
    await nextTick()
    await delay(10)
  }
  active.value = false
  await nextTick()
  await delay(500)
  app.unmount()
  await delay(500)
  result.value = JSON.stringify(
    {
      test: '100 rapid native directive cycles',
      namespace,
      masks: document.querySelectorAll('.fl-loading-adapter').length,
      pendingCallbacks: pendingFrames.size,
      detachedCanvasCount: root.value!.querySelectorAll('canvas').length
    },
    null,
    2
  )
  busy.value = false
}
createApp({
  setup: () => () =>
    h('main', [
      h('button', { disabled: busy.value, onClick: measure }, 'Run 30-second benchmark'),
      h('button', { disabled: busy.value, onClick: stress }, 'Run namespace and 100-cycle test'),
      h('div', { ref: root, style: 'padding:24px;min-height:220px' }),
      h('pre', { id: 'results', style: 'white-space:pre-wrap' }, result.value)
    ])
}).mount('#app')
