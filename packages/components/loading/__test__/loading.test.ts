import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createSSRApp, defineComponent, h, KeepAlive, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import FlLoading from '../src/FlLoading.vue'
import { setupCanvas } from './loading-fixtures'

describe('FlLoading', () => {
  let fixture: ReturnType<typeof setupCanvas>
  const wrappers: Array<{ unmount(): void }> = []
  beforeEach(() => {
    fixture = setupCanvas()
  })
  afterEach(() => {
    wrappers.forEach((w) => w.unmount())
    wrappers.length = 0
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })
  const render = (props = {}) => {
    const wrapper = mount(FlLoading, { props, attachTo: document.body })
    wrappers.push(wrapper)
    return wrapper
  }
  it('updates without replacing the canvas and retains space when inactive', async () => {
    const wrapper = render({ text: 'Searching' })
    const canvas = wrapper.find('canvas').element
    expect(wrapper.classes()).toEqual(['fl-loading', 'fl-loading--inline'])
    expect(wrapper.find('.fl-loading__visual canvas.fl-loading__canvas').exists()).toBe(true)
    expect(wrapper.find('.fl-loading__text').text()).toBe('Searching')
    expect(wrapper.attributes('role')).toBe('status')
    await wrapper.setProps({
      size: 20,
      text: 'Earth',
      animation: 'earth',
      color: 'red',
      layout: 'vertical'
    })
    expect(wrapper.classes()).toContain('fl-loading--vertical')
    expect(wrapper.classes()).not.toContain('fl-loading--inline')
    expect(wrapper.find('canvas').element).toBe(canvas)
    expect(canvas.width).toBe(20)
    expect(wrapper.text()).toBe('Earth')
    await wrapper.setProps({ active: false })
    expect(wrapper.classes()).toContain('is-inactive')
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(fixture.frames.size).toBe(0)
  })
  it('freezes time, resumes without a jump and cleans up listeners', async () => {
    const wrapper = render()
    fixture.step(1000)
    fixture.step(1100)
    const frame = fixture.ctx.arc.mock.calls.slice(-20)
    await wrapper.setProps({ paused: true })
    expect(fixture.frames.size).toBe(0)
    await wrapper.setProps({ paused: false })
    fixture.step(100000)
    expect(fixture.ctx.arc.mock.calls.slice(-20)).toEqual(frame)
    fixture.intersect(false)
    expect(fixture.frames.size).toBe(0)
    fixture.intersect(true)
    expect(fixture.frames.size).toBe(1)
    fixture.reduce(true)
    expect(fixture.frames.size).toBe(0)
    fixture.reduce(false)
    expect(fixture.frames.size).toBe(1)
    wrapper.unmount()
    wrappers.pop()
    expect(fixture.frames.size).toBe(0)
    expect(fixture.disconnect).toHaveBeenCalled()
    expect([...fixture.media.values()].every((m) => m.listeners.size === 0)).toBe(true)
  })
  it('pauses on hidden documents and KeepAlive deactivation', async () => {
    const shown = ref(true)
    const Host = defineComponent({
      setup: () => () => h(KeepAlive, null, { default: () => (shown.value ? h(FlLoading) : null) })
    })
    const wrapper = mount(Host)
    wrappers.push(wrapper)
    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
    document.dispatchEvent(new Event('visibilitychange'))
    expect(fixture.frames.size).toBe(0)
    visibility.mockReturnValue('visible')
    document.dispatchEvent(new Event('visibilitychange'))
    expect(fixture.frames.size).toBe(1)
    shown.value = false
    await nextTick()
    expect(fixture.frames.size).toBe(0)
    shown.value = true
    await nextTick()
    expect(fixture.frames.size).toBe(1)
  })
  it('renders an accessible fallback without Canvas and is SSR safe', async () => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null)
    const wrapper = render({ ariaLabel: 'Loading data' })
    await nextTick()
    expect(wrapper.find('.fl-loading__fallback').exists()).toBe(true)
    expect(wrapper.attributes('aria-label')).toBe('Loading data')
    expect(fixture.frames.size).toBe(0)
    expect(await renderToString(createSSRApp(FlLoading))).toContain('fl-loading')
  })
  it('uses one status text, supports slots and resolves explicit color', async () => {
    const wrapper = mount(FlLoading, {
      props: { text: 'ignored', color: 'red' },
      slots: { text: '<span>Custom status</span>' },
      attachTo: document.body
    })
    wrappers.push(wrapper)
    await nextTick()
    expect(wrapper.text()).toBe('Custom status')
    expect(wrapper.attributes('aria-label')).toBeUndefined()
    expect(fixture.ctx.fillStyle).toBe('rgb(255, 0, 0)')
  })
})
