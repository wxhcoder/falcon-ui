import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Text, createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import type { FlTextShimmerProps, TextShimmerProps } from '..'
import FlTextShimmer from '../src/text-shimmer.vue'

enableAutoUnmount(afterEach)

describe('FlTextShimmer', () => {
  it('renders its default tag and text prop', () => {
    const wrapper = mount(FlTextShimmer, { props: { text: 'Scanning' } })

    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.text()).toBe('Scanning')
    expect(wrapper.classes()).toContain('fl-text-shimmer')
    expect(wrapper.element.style.getPropertyValue('--fl-text-shimmer-duration')).toBe('2s')
    expect(wrapper.element.style.getPropertyValue('--fl-text-shimmer-spread')).toBe('16px')
  })

  it('uses default slot text before the text prop and preserves string length semantics', () => {
    const wrapper = mount(FlTextShimmer, {
      props: { text: 'ignored', spread: 2 },
      slots: {
        default: () => [h(Text, '中 文'), h(Text, ' 😀')]
      }
    })

    expect(wrapper.text()).toBe('中 文 😀')
    expect(wrapper.element.style.getPropertyValue('--fl-text-shimmer-spread')).toBe('12px')
  })

  it('updates text, duration, spread and colors at runtime', async () => {
    const wrapper = mount(FlTextShimmer, { props: { text: 'One' } })

    await wrapper.setProps({
      as: 'p',
      text: '报告 😀',
      duration: 4,
      spread: 3,
      color: '#64748b',
      shimmerColor: '#0ea5e9'
    })

    expect(wrapper.element.tagName).toBe('P')
    expect(wrapper.text()).toBe('报告 😀')
    expect(wrapper.element.style.getPropertyValue('--fl-text-shimmer-duration')).toBe('4s')
    expect(wrapper.element.style.getPropertyValue('--fl-text-shimmer-spread')).toBe('15px')
    expect(wrapper.element.style.getPropertyValue('--fl-text-shimmer-text-color')).toBe('#64748b')
    expect(wrapper.element.style.getPropertyValue('--fl-text-shimmer-highlight-color')).toBe(
      '#0ea5e9'
    )
  })

  it('falls back for invalid animation numbers without throwing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const wrapper = mount(FlTextShimmer, {
      props: { text: 'Ready', duration: Number.NaN, spread: Number.POSITIVE_INFINITY }
    })

    expect(wrapper.element.style.getPropertyValue('--fl-text-shimmer-duration')).toBe('2s')
    expect(wrapper.element.style.getPropertyValue('--fl-text-shimmer-spread')).toBe('10px')
    expect(warn).toHaveBeenCalledTimes(2)
    warn.mockRestore()
  })

  it('merges native attributes and exposes the disabled BEM state', async () => {
    const wrapper = mount(FlTextShimmer, {
      props: { text: 'Generating', disabled: true },
      attrs: {
        class: 'business-copy',
        style: 'font-weight: 700',
        title: 'Task status',
        'aria-label': 'Generating report'
      }
    })

    expect(wrapper.classes()).toContain('fl-text-shimmer')
    expect(wrapper.classes()).toContain('is-disabled')
    expect(wrapper.classes()).toContain('business-copy')
    expect(wrapper.attributes('title')).toBe('Task status')
    expect(wrapper.attributes('aria-label')).toBe('Generating report')
    expect((wrapper.element as HTMLElement).style.fontWeight).toBe('700')

    await wrapper.setProps({ disabled: false })
    expect(wrapper.classes()).not.toContain('is-disabled')
  })

  it('renders no placeholder for empty content and remains SSR safe', async () => {
    const wrapper = mount(FlTextShimmer, { props: { text: 'Before' } })
    await wrapper.setProps({ text: '' })

    expect(wrapper.text()).toBe('')
    expect(await renderToString(createSSRApp(FlTextShimmer, { text: 'Server text' }))).toContain(
      'Server text'
    )
  })

  it('exports its public prop types', () => {
    type TypeSmoke = [FlTextShimmerProps, TextShimmerProps]
    const typeSmoke: TypeSmoke | null = null

    expect(typeSmoke).toBeNull()
  })
})
