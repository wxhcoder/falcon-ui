import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import FlInputNumber from '../src/input-number.vue'

describe('FlInputNumber', () => {
  it('passes listeners through, emits custom payload, and normalizes string number', async () => {
    const onInput = vi.fn()
    const onUpdateModelValue = vi.fn()

    const wrapper = mount(FlInputNumber, {
      attrs: {
        onInput,
        'onUpdate:modelValue': onUpdateModelValue
      },
      props: {
        debugLabel: 'probe',
        debugMode: true,
        modelValue: null
      }
    })

    expect(wrapper.find('.el-input').exists()).toBe(true)
    expect(wrapper.find('.el-input').classes()).toContain('fl-input-number')

    await wrapper.get('input').setValue('123.45')

    expect(onInput).toHaveBeenCalledWith('123.45')
    expect(onUpdateModelValue).toHaveBeenCalledWith(123.45)
    expect(wrapper.emitted('custom-input')?.[0]).toEqual([{ rawValue: '123.45', value: 123.45 }])
    expect(wrapper.emitted('debug-event')?.[0]).toEqual([
      { label: 'probe', rawValue: '123.45', value: 123.45 }
    ])
  })

  it('clears model value for invalid external value', async () => {
    const onUpdateModelValue = vi.fn()
    const wrapper = mount(FlInputNumber, {
      attrs: {
        'onUpdate:modelValue': onUpdateModelValue
      },
      props: {
        modelValue: 12
      }
    })

    await wrapper.setProps({
      modelValue: 'abc'
    })

    expect(onUpdateModelValue).toHaveBeenLastCalledWith(null)
  })

  it('applies ROUND mode on change', async () => {
    const wrapper = mount(FlInputNumber, {
      props: {
        modelValue: null,
        precision: 2,
        precisionMode: 'ROUND'
      }
    })

    const input = wrapper.get('input')
    await input.setValue('1.236')
    await input.trigger('change')

    const updateEvents = wrapper.emitted('update:modelValue') ?? []
    expect(updateEvents.at(-1)).toEqual([1.24])
  })

  it('applies FIXED mode on change', async () => {
    const wrapper = mount(FlInputNumber, {
      props: {
        modelValue: null,
        precision: 2,
        precisionMode: 'FIXED'
      }
    })

    const input = wrapper.get('input')
    await input.setValue('1.236')
    await input.trigger('change')

    const updateEvents = wrapper.emitted('update:modelValue') ?? []
    expect(updateEvents.at(-1)).toEqual([1.23])
  })

  it('triggers strict-error, update:isError and placeholder in STRICT mode', async () => {
    const wrapper = mount(FlInputNumber, {
      props: {
        modelValue: null,
        precision: 2,
        precisionMode: 'STRICT',
        strictErrorPlaceholder: '精度不对'
      }
    })

    const input = wrapper.get('input')
    await input.setValue('1.236')
    await input.trigger('change')

    expect(wrapper.emitted('strict-error')?.[0]).toEqual([
      { rawValue: '1.236', precision: 2, actualPrecision: 3 }
    ])
    expect(wrapper.emitted('update:isError')?.[0]).toEqual([true])
    expect(wrapper.find('.el-input').classes()).toContain('is-error')
    expect(input.attributes('placeholder')).toBe('精度不对')
  })

  it('formats display with default thousand separator while keeping model value numeric', async () => {
    const onUpdateModelValue = vi.fn()
    const wrapper = mount(FlInputNumber, {
      attrs: {
        'onUpdate:modelValue': onUpdateModelValue
      },
      props: {
        modelValue: 12345.67,
        isFormat: true
      }
    })

    expect(wrapper.get('input').element.value).toBe('12,345.67')

    const input = wrapper.get('input')
    await input.setValue('9999.9')
    await input.trigger('change')

    expect(onUpdateModelValue).toHaveBeenCalledWith(9999.9)
    expect(input.element.value).toBe('9,999.9')
  })

  it('uses ElInput formatter/parser attrs when isFormat is enabled', () => {
    const wrapper = mount(FlInputNumber, {
      attrs: {
        formatter: (value: string) => `USD ${value}`,
        parser: (value: string) => value.replace(/^USD\\s*/, '')
      },
      props: {
        modelValue: 1234,
        isFormat: true
      }
    })

    expect(wrapper.get('input').element.value).toBe('USD 1234')
  })

  it('keeps clear behavior when isError is true', () => {
    const onUpdateModelValue = vi.fn()

    mount(FlInputNumber, {
      attrs: {
        'onUpdate:modelValue': onUpdateModelValue
      },
      props: {
        isError: true,
        modelValue: 10
      }
    })

    expect(onUpdateModelValue).toHaveBeenCalledTimes(1)
    expect(onUpdateModelValue).toHaveBeenCalledWith(null)
  })

  it('forwards ElInput exposed instance methods', () => {
    const wrapper = mount(FlInputNumber, {
      props: {
        modelValue: 12
      }
    })

    const exposed = wrapper.vm as unknown as {
      blur?: () => void
      clear?: () => void
      focus?: () => void
    }

    expect(typeof exposed.focus).toBe('function')
    expect(typeof exposed.blur).toBe('function')
    expect(typeof exposed.clear).toBe('function')
  })
})
