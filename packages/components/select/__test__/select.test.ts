import { mount } from '@vue/test-utils'
import { ElSelect } from 'element-plus'
import { describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import type { FlSelectEmits, FlSelectProps } from '..'
import FlSelect from '../src/select.vue'

describe('FlSelect', () => {
  it('renders with fl-select class and preserves user class', () => {
    const wrapper = mount(FlSelect, {
      attrs: {
        class: 'biz-select'
      }
    })

    const select = wrapper.get('.el-select')
    expect(select.classes()).toContain('fl-select')
    expect(select.classes()).toContain('biz-select')
  })

  it('passes common attrs through to ElSelect', () => {
    const wrapper = mount(FlSelect, {
      attrs: {
        disabled: true,
        placeholder: 'please select'
      }
    })

    const select = wrapper.getComponent(ElSelect)
    expect(select.props('disabled')).toBe(true)
    expect(select.props('placeholder')).toBe('please select')
  })

  it('enables clearable by default', () => {
    const wrapper = mount(FlSelect)
    expect(wrapper.getComponent(ElSelect).props('clearable')).toBe(true)
  })

  it('allows overriding clearable from attrs', () => {
    const wrapper = mount(FlSelect, {
      attrs: {
        clearable: false
      }
    })

    expect(wrapper.getComponent(ElSelect).props('clearable')).toBe(false)
  })

  it('applies error and table state classes', async () => {
    const wrapper = mount(FlSelect, {
      props: {
        isError: false,
        isTable: false
      }
    })

    const select = wrapper.get('.el-select')
    expect(select.classes()).not.toContain('is-error')
    expect(select.classes()).not.toContain('is-table')

    await wrapper.setProps({
      isError: true,
      isTable: true
    })

    expect(select.classes()).toContain('is-error')
    expect(select.classes()).toContain('is-table')
  })

  it('clears model value immediately when isError is true', () => {
    const onUpdateModelValue = vi.fn()

    mount(FlSelect, {
      attrs: {
        'onUpdate:modelValue': onUpdateModelValue
      },
      props: {
        isError: true,
        modelValue: 'A'
      }
    })

    expect(onUpdateModelValue).toHaveBeenCalledTimes(1)
    expect(onUpdateModelValue).toHaveBeenCalledWith(undefined)
  })

  it('clears model value when isError switches to true', async () => {
    const onUpdateModelValue = vi.fn()
    const wrapper = mount(FlSelect, {
      attrs: {
        'onUpdate:modelValue': onUpdateModelValue
      },
      props: {
        isError: false,
        modelValue: 'A'
      }
    })

    expect(onUpdateModelValue).not.toHaveBeenCalled()

    await wrapper.setProps({ isError: true })

    expect(onUpdateModelValue).toHaveBeenCalledTimes(1)
    expect(onUpdateModelValue).toHaveBeenCalledWith(undefined)
  })

  it('uses empty array as clear payload in multiple mode', () => {
    const onUpdateModelValue = vi.fn()

    mount(FlSelect, {
      attrs: {
        multiple: true,
        'onUpdate:modelValue': onUpdateModelValue
      },
      props: {
        isError: true,
        modelValue: ['A']
      }
    })

    expect(onUpdateModelValue).toHaveBeenCalledTimes(1)
    expect(onUpdateModelValue).toHaveBeenCalledWith([])
  })

  it('keeps original change and update:modelValue listeners working', () => {
    const onChange = vi.fn()
    const onUpdateModelValue = vi.fn()
    const wrapper = mount(FlSelect, {
      attrs: {
        onChange,
        'onUpdate:modelValue': onUpdateModelValue
      }
    })

    const select = wrapper.getComponent(ElSelect)
    select.vm.$emit('change', 'A')
    select.vm.$emit('update:modelValue', 'A')

    expect(onChange).toHaveBeenCalledWith('A')
    expect(onUpdateModelValue).toHaveBeenCalledWith('A')
  })

  it('passes slots through', () => {
    const wrapper = mount(FlSelect, {
      slots: {
        prefix: () => h('span', { class: 'prefix-probe' }, 'prefix')
      }
    })

    expect(wrapper.find('.prefix-probe').exists()).toBe(true)
  })

  it('forwards ElSelect exposed instance methods', () => {
    const wrapper = mount(FlSelect)

    const exposed = wrapper.vm as unknown as {
      blur?: () => void
      focus?: () => void
    }

    expect(typeof exposed.focus).toBe('function')
    expect(typeof exposed.blur).toBe('function')
  })

  it('supports type exports from component entry', () => {
    type TypeSmoke = [FlSelectProps, FlSelectEmits]
    const typeSmoke: TypeSmoke | null = null

    expect(typeSmoke).toBeNull()
  })
})
