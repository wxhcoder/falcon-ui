import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import FlInput from '../src/input.vue'

describe('FlInput', () => {
  it('passes attrs listeners through and emits custom-input', async () => {
    const onInput = vi.fn()
    const onUpdateModelValue = vi.fn()

    const wrapper = mount(FlInput, {
      attrs: {
        onInput,
        'onUpdate:modelValue': onUpdateModelValue
      },
      props: {
        debugLabel: 'probe',
        debugMode: true,
        modelValue: ''
      },
      slots: {
        prefix: () => h('span', 'prefix')
      }
    })

    expect(wrapper.find('.el-input').exists()).toBe(true)
    expect(wrapper.find('.el-input').classes()).toContain('fl-input')
    expect(wrapper.text()).toContain('prefix')

    await wrapper.get('input').setValue('hello')

    expect(onInput).toHaveBeenCalledWith('hello')
    expect(onUpdateModelValue).toHaveBeenCalledWith('hello')
    expect(wrapper.emitted('custom-input')?.[0]).toEqual([{ value: 'hello', length: 5 }])
    expect(wrapper.emitted('debug-event')?.[0]).toEqual([{ label: 'probe', value: 'hello' }])
  })

  it('forwards ElInput exposed instance methods', () => {
    const wrapper = mount(FlInput, {
      props: {
        modelValue: 'value'
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

  it('clears model value immediately when isError is true', () => {
    const onUpdateModelValue = vi.fn()

    mount(FlInput, {
      attrs: {
        'onUpdate:modelValue': onUpdateModelValue
      },
      props: {
        isError: true,
        modelValue: 'hello'
      }
    })

    expect(onUpdateModelValue).toHaveBeenCalledTimes(1)
    expect(onUpdateModelValue).toHaveBeenCalledWith('')
  })

  it('clears model value and adds error class when isError switches to true', async () => {
    const onUpdateModelValue = vi.fn()
    const wrapper = mount(FlInput, {
      attrs: {
        'onUpdate:modelValue': onUpdateModelValue
      },
      props: {
        isError: false,
        modelValue: 'hello'
      }
    })

    expect(onUpdateModelValue).not.toHaveBeenCalled()

    await wrapper.setProps({ isError: true })

    expect(wrapper.find('.el-input').classes()).toContain('is-error')
    expect(onUpdateModelValue).toHaveBeenCalledTimes(1)
    expect(onUpdateModelValue).toHaveBeenCalledWith('')
  })

  it('adds table class when isTable is true', () => {
    const wrapper = mount(FlInput, {
      props: {
        isTable: true,
        modelValue: 'cell'
      }
    })

    expect(wrapper.find('.el-input').classes()).toContain('is-table')
  })

  it('keeps clear behavior for table input when isError is true', () => {
    const onUpdateModelValue = vi.fn()
    const wrapper = mount(FlInput, {
      attrs: {
        'onUpdate:modelValue': onUpdateModelValue
      },
      props: {
        isTable: true,
        isError: true,
        modelValue: 'hello'
      }
    })

    expect(wrapper.find('.el-input').classes()).toContain('is-table')
    expect(wrapper.find('.el-input').classes()).toContain('is-error')
    expect(onUpdateModelValue).toHaveBeenCalledTimes(1)
    expect(onUpdateModelValue).toHaveBeenCalledWith('')
  })
})
