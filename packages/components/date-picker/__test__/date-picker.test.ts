import { mount } from '@vue/test-utils'
import { ElDatePicker } from 'element-plus'
import { describe, expect, it, vi } from 'vitest'
import FlDatePicker from '../src/date-picker.vue'

describe('FlDatePicker', () => {
  it('passes attrs listeners through', () => {
    const onChange = vi.fn()
    const wrapper = mount(FlDatePicker, {
      attrs: {
        onChange
      },
      props: {
        modelValue: null
      }
    })

    const elDatePicker = wrapper.findComponent(ElDatePicker)
    expect(elDatePicker.exists()).toBe(true)
    expect(wrapper.find('.fl-date-picker').exists()).toBe(true)

    const vnodeProps = (elDatePicker.vm.$.vnode.props ?? {}) as {
      onChange?: (value: unknown) => void
    }
    const innerOnChange = vnodeProps.onChange
    expect(typeof innerOnChange).toBe('function')
    innerOnChange?.('2026-03-05')
    expect(onChange).toHaveBeenCalledWith('2026-03-05')
  })

  it('clears model value immediately when isError is true', () => {
    const onUpdateModelValue = vi.fn()

    mount(FlDatePicker, {
      attrs: {
        'onUpdate:modelValue': onUpdateModelValue
      },
      props: {
        isError: true,
        modelValue: '2026-03-05'
      }
    })

    expect(onUpdateModelValue).toHaveBeenCalledTimes(1)
    expect(onUpdateModelValue).toHaveBeenCalledWith(null)
  })

  it('clears model value and adds error class when isError switches to true', async () => {
    const onUpdateModelValue = vi.fn()
    const wrapper = mount(FlDatePicker, {
      attrs: {
        'onUpdate:modelValue': onUpdateModelValue
      },
      props: {
        isError: false,
        modelValue: '2026-03-05'
      }
    })

    expect(onUpdateModelValue).not.toHaveBeenCalled()

    await wrapper.setProps({ isError: true })

    expect(wrapper.find('.fl-date-picker').classes()).toContain('is-error')
    expect(onUpdateModelValue).toHaveBeenCalledTimes(1)
    expect(onUpdateModelValue).toHaveBeenCalledWith(null)
  })

  it('adds table class when isTable is true', () => {
    const wrapper = mount(FlDatePicker, {
      props: {
        isTable: true,
        modelValue: null
      }
    })

    expect(wrapper.find('.fl-date-picker').classes()).toContain('is-table')
  })

  it('keeps clear behavior for table mode when isError is true', () => {
    const onUpdateModelValue = vi.fn()
    const wrapper = mount(FlDatePicker, {
      attrs: {
        'onUpdate:modelValue': onUpdateModelValue
      },
      props: {
        isTable: true,
        isError: true,
        modelValue: '2026-03-05'
      }
    })

    expect(wrapper.find('.fl-date-picker').classes()).toContain('is-table')
    expect(wrapper.find('.fl-date-picker').classes()).toContain('is-error')
    expect(onUpdateModelValue).toHaveBeenCalledTimes(1)
    expect(onUpdateModelValue).toHaveBeenCalledWith(null)
  })

  it('uses null as clear payload for all supported picker types', () => {
    const pickerTypes = [
      'date',
      'dates',
      'datetime',
      'week',
      'month',
      'year',
      'daterange',
      'datetimerange',
      'monthrange',
      'yearrange'
    ] as const

    for (const type of pickerTypes) {
      const onUpdateModelValue = vi.fn()

      mount(FlDatePicker, {
        attrs: {
          type,
          'onUpdate:modelValue': onUpdateModelValue
        },
        props: {
          isError: true,
          modelValue: null
        }
      })

      expect(onUpdateModelValue).toHaveBeenCalledTimes(1)
      expect(onUpdateModelValue).toHaveBeenCalledWith(null)
    }
  })
})
