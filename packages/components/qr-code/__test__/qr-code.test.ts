import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import type { FlQrCodeProps, QrCodeProps } from '..'
import FlQrCode from '../src/qr-code.vue'

const { toCanvasMock, toStringMock } = vi.hoisted(() => ({
  toCanvasMock: vi.fn(async (canvas: HTMLCanvasElement) => {
    canvas.dataset.rendered = 'canvas'
  }),
  toStringMock: vi.fn(async () => '<svg data-rendered="svg"></svg>')
}))

vi.mock('qrcode', () => ({
  toCanvas: toCanvasMock,
  toString: toStringMock
}))

enableAutoUnmount(afterEach)

const waitForRender = async () => {
  await nextTick()
  await Promise.resolve()
  await nextTick()
}

describe('FlQrCode', () => {
  beforeEach(() => {
    toCanvasMock.mockClear()
    toStringMock.mockClear()
  })

  it('renders canvas output by default', async () => {
    const wrapper = mount(FlQrCode, {
      props: {
        value: 'https://falcon-ui.dev'
      }
    })

    await waitForRender()

    expect(wrapper.find('canvas').exists()).toBe(true)
    expect(toCanvasMock).toHaveBeenCalledTimes(1)
  })

  it('switches between canvas and svg outputs', async () => {
    const wrapper = mount(FlQrCode, {
      props: {
        value: 'https://falcon-ui.dev'
      }
    })

    await waitForRender()
    expect(wrapper.find('canvas').exists()).toBe(true)

    await wrapper.setProps({ type: 'svg' })
    await waitForRender()

    expect(wrapper.find('canvas').exists()).toBe(false)
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(toStringMock).toHaveBeenCalledTimes(1)
  })

  it('passes core render props through to qrcode', async () => {
    const wrapper = mount(FlQrCode, {
      props: {
        value: 'https://falcon-ui.dev',
        size: 180,
        color: '#111111',
        backgroundColor: '#f8fafc',
        padding: 20,
        errorCorrectionLevel: 'H',
        type: 'svg'
      }
    })

    await waitForRender()

    expect(toStringMock).toHaveBeenCalledWith(
      'https://falcon-ui.dev',
      expect.objectContaining({
        type: 'svg',
        width: 140,
        margin: 0,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#111111',
          light: '#f8fafc'
        }
      })
    )

    await wrapper.setProps({
      value: 'https://falcon-ui.dev/docs',
      padding: 12,
      size: 160
    })
    await waitForRender()

    expect(toStringMock).toHaveBeenLastCalledWith(
      'https://falcon-ui.dev/docs',
      expect.objectContaining({
        width: 136,
        margin: 0
      })
    )

    expect(wrapper.get('.fl-qr-code__render').attributes('style')).toContain('inset: 12px')
  })

  it('renders icon overlay on top of the QR code', async () => {
    const wrapper = mount(FlQrCode, {
      props: {
        value: 'https://falcon-ui.dev',
        type: 'svg',
        iconSrc: 'https://falcon-ui.dev/icon.png',
        iconSize: 36,
        iconBorderRadius: 10,
        iconBackgroundColor: '#ffffff'
      }
    })

    await waitForRender()

    const icon = wrapper.get('.fl-qr-code__icon')
    expect((icon.element as HTMLElement).style.width).toBe('36px')
    expect((icon.element as HTMLElement).style.borderRadius).toBe('10px')
    expect(wrapper.get('img').attributes('src')).toBe('https://falcon-ui.dev/icon.png')
  })

  it('clears the render area for empty value', async () => {
    const wrapper = mount(FlQrCode, {
      props: {
        value: 'https://falcon-ui.dev'
      }
    })

    await waitForRender()
    expect(wrapper.find('canvas').exists()).toBe(true)

    await wrapper.setProps({ value: '' })
    await waitForRender()

    expect(wrapper.find('canvas').exists()).toBe(false)
    expect(wrapper.find('svg').exists()).toBe(false)
  })

  it('supports type exports from component entry', () => {
    type TypeSmoke = [FlQrCodeProps, QrCodeProps]
    const typeSmoke: TypeSmoke | null = null

    expect(typeSmoke).toBeNull()
  })
})
