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
})
