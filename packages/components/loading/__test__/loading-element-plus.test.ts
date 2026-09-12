import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref, withDirectives } from 'vue'
import { ElLoading } from 'element-plus'
import { useFlLoading } from '../src/use-fl-loading'
import { setupCanvas } from './loading-fixtures'

describe('native Element Plus loading adapter', () => {
  let fixture: ReturnType<typeof setupCanvas>
  const wrappers: Array<{ unmount(): void }> = []
  beforeEach(() => {
    vi.useFakeTimers()
    fixture = setupCanvas()
  })
  afterEach(async () => {
    wrappers.forEach((w) => w.unmount())
    wrappers.length = 0
    await vi.advanceTimersByTimeAsync(500)
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })
  const render = (modifiers = {}) => {
    const pending = ref(false),
      text = ref('Searching'),
      themeTarget = ref<HTMLElement>()
    const Host = defineComponent({
      setup() {
        const binding = useFlLoading(pending, () => ({
          animation: 'earth',
          text: text.value,
          themeTarget
        }))
        return () =>
          withDirectives(h('section', { ref: themeTarget }, 'Content'), [
            [ElLoading.directive, binding.value, undefined, modifiers]
          ])
      }
    })
    const wrapper = mount(Host, {
      attachTo: document.body,
      global: { stubs: { transition: false } }
    })
    wrappers.push(wrapper)
    return { wrapper, pending, text }
  }
  it('mounts, updates without remount, stops on close, reopens and cleans up host', async () => {
    const { wrapper, pending, text } = render()
    pending.value = true
    await nextTick()
    await nextTick()
    const canvas = document.querySelector('.fl-loading-adapter canvas')
    expect(canvas).not.toBeNull()
    text.value = 'Updated'
    await nextTick()
    await nextTick()
    expect(document.querySelector('.fl-loading-adapter canvas')).toBe(canvas)
    expect(document.querySelector('.fl-loading__text')?.textContent).toBe('Updated')
    pending.value = false
    await nextTick()
    await nextTick()
    expect(
      document.querySelector('.fl-loading-adapter .fl-loading')?.classList.contains('is-inactive')
    ).toBe(true)
    pending.value = true
    await nextTick()
    await nextTick()
    expect(
      document.querySelectorAll('.fl-loading-adapter .fl-loading:not(.is-inactive)')
    ).toHaveLength(1)
    await vi.advanceTimersByTimeAsync(500)
    expect(document.querySelectorAll('.fl-loading-adapter')).toHaveLength(1)
    wrapper.unmount()
    wrappers.pop()
    await vi.advanceTimersByTimeAsync(500)
    fixture.step(1000)
    fixture.step(1016)
    fixture.step(1032)
    expect(document.querySelectorAll('.fl-loading-adapter')).toHaveLength(0)
    expect(fixture.frames.size).toBe(0)
  })
  it.each([{ body: true }, { fullscreen: true, lock: true }])(
    'retains native modifiers %j',
    async (modifiers) => {
      const { pending } = render(modifiers)
      pending.value = true
      await nextTick()
      await nextTick()
      expect(document.querySelector('.fl-loading-adapter')?.parentElement).toBe(document.body)
      if (modifiers.lock)
        expect(document.body.classList.contains('el-loading-parent--hidden')).toBe(true)
      pending.value = false
      await nextTick()
      await vi.advanceTimersByTimeAsync(500)
      expect(document.body.classList.contains('el-loading-parent--hidden')).toBe(false)
    }
  )
  it('survives 100 open/close cycles without retaining masks or animation callbacks', async () => {
    const { pending } = render()
    for (let i = 0; i < 100; i++) {
      pending.value = true
      await nextTick()
      await nextTick()
      pending.value = false
      await nextTick()
      await vi.advanceTimersByTimeAsync(500)
      fixture.step(i * 1000)
      fixture.step(i * 1000 + 16)
      fixture.step(i * 1000 + 32)
    }
    expect(document.querySelectorAll('.fl-loading-adapter')).toHaveLength(0)
    expect(fixture.frames.size).toBe(0)
  })
})
