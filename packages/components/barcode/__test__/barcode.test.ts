import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import FlBarcode from '..'

const { barcodeMock } = vi.hoisted(() => ({
  barcodeMock: vi.fn((element: SVGSVGElement, value: string, options: Record<string, unknown>) => {
    const resolvedText = typeof options.text === 'string' ? options.text : value
    const displayValue = options.displayValue !== false

    element.innerHTML = [
      `<g data-format="${String(options.format)}"`,
      ` data-value="${value}"`,
      ` data-width="${String(options.width)}"`,
      ` data-height="${String(options.height)}"`,
      ` data-line-color="${String(options.lineColor)}"`,
      ` data-background="${String(options.background)}"`,
      ` data-text-align="${String(options.textAlign)}"`,
      ` data-text-position="${String(options.textPosition)}"`,
      ` data-font="${String(options.font)}"`,
      ` data-font-options="${String(options.fontOptions)}"`,
      ` data-font-size="${String(options.fontSize)}"`,
      ` data-text-margin="${String(options.textMargin)}"`,
      ` data-margin="${String(options.margin)}"`,
      displayValue ? `>${resolvedText}</g>` : '></g>'
    ].join('')
  })
}))

vi.mock('jsbarcode', () => ({
  default: barcodeMock
}))

enableAutoUnmount(afterEach)

const waitForRender = async () => {
  await nextTick()
  await new Promise((resolve) => setTimeout(resolve, 0))
  await nextTick()
}

beforeEach(() => {
  barcodeMock.mockClear()
})

describe('FlBarcode', () => {
  it('renders a basic barcode', async () => {
    const wrapper = mount(FlBarcode, {
      props: {
        value: 'FALCON-128'
      }
    })

    await waitForRender()

    const svg = wrapper.get('svg').element as SVGSVGElement

    expect(barcodeMock).toHaveBeenCalledTimes(1)
    expect(svg.innerHTML).toContain('data-format="CODE128"')
    expect(svg.textContent).toContain('FALCON-128')
  })

  it('switches supported formats', async () => {
    const wrapper = mount(FlBarcode, {
      props: {
        value: '1234567',
        format: 'CODE128'
      }
    })

    const formatCases = [
      ['CODE128', 'CODE128', 'FALCON-128'],
      ['CODE39', 'CODE39', 'FALCON-39'],
      ['EAN13', 'EAN13', '590123412345'],
      ['EAN8', 'EAN8', '9638507'],
      ['UPCA', 'UPC', '04210000526'],
      ['UPCE', 'UPCE', '123456']
    ] as const

    for (const [propFormat, expectedFormat, value] of formatCases) {
      await wrapper.setProps({ format: propFormat, value })
      await waitForRender()

      expect(barcodeMock.mock.calls[barcodeMock.mock.calls.length - 1]?.[2]).toMatchObject({
        format: expectedFormat
      })
      expect(wrapper.get('svg').element.innerHTML).toContain(`data-format="${expectedFormat}"`)
    }
  })

  it('controls readable text display and override text', async () => {
    const wrapper = mount(FlBarcode, {
      props: {
        value: '590123412345',
        displayValue: false
      }
    })

    await waitForRender()

    expect(wrapper.get('svg').text()).toBe('')
    expect(barcodeMock.mock.calls[barcodeMock.mock.calls.length - 1]?.[2]).toMatchObject({
      displayValue: false
    })

    await wrapper.setProps({
      displayValue: true,
      text: 'SKU-0001'
    })
    await waitForRender()

    expect(wrapper.get('svg').text()).toContain('SKU-0001')
    expect(barcodeMock.mock.calls[barcodeMock.mock.calls.length - 1]?.[2]).toMatchObject({
      displayValue: true,
      text: 'SKU-0001'
    })
  })

  it('applies sizing, color, and text style options', async () => {
    const wrapper = mount(FlBarcode, {
      props: {
        value: '04210000526',
        format: 'UPCA',
        width: 3,
        height: 120,
        color: '#123456',
        backgroundColor: '#f5f5f5',
        font: 'Arial',
        fontOptions: 'bold italic',
        fontSize: 16,
        textAlign: 'right',
        textPosition: 'top',
        textMargin: 8,
        margin: 18,
        marginTop: 20,
        marginRight: 22,
        marginBottom: 24,
        marginLeft: 26
      }
    })

    await waitForRender()

    expect(barcodeMock.mock.calls[barcodeMock.mock.calls.length - 1]?.[2]).toMatchObject({
      format: 'UPC',
      width: 3,
      height: 120,
      lineColor: '#123456',
      background: '#f5f5f5',
      font: 'Arial',
      fontOptions: 'bold italic',
      fontSize: 16,
      textAlign: 'right',
      textPosition: 'top',
      textMargin: 8,
      margin: 18,
      marginTop: 20,
      marginRight: 22,
      marginBottom: 24,
      marginLeft: 26
    })

    expect(wrapper.get('svg').element.innerHTML).toContain('data-line-color="#123456"')
    expect(wrapper.get('svg').element.innerHTML).toContain('data-background="#f5f5f5"')
  })

  it('clears the render area for empty values', async () => {
    const wrapper = mount(FlBarcode, {
      props: {
        value: 'FALCON-128'
      }
    })

    await waitForRender()
    expect(wrapper.get('svg').element.innerHTML).not.toBe('')

    const callCountBeforeClear = barcodeMock.mock.calls.length

    await wrapper.setProps({ value: '' })
    await waitForRender()

    expect(wrapper.get('svg').element.innerHTML).toBe('')
    expect(barcodeMock.mock.calls.length).toBe(callCountBeforeClear)
  })
})
