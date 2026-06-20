import { mount } from '@vue/test-utils'
import { ElTreeSelect } from 'element-plus'
import { describe, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'
import type { TreeSelectEmits, TreeSelectProps } from '..'
import FlTreeSelect from '../src/tree-select.vue'

const treeData = [
  {
    value: 'engineering',
    label: 'Engineering',
    children: [
      { value: 'frontend', label: 'Frontend' },
      { value: 'backend', label: 'Backend' }
    ]
  },
  {
    value: 'design',
    label: 'Design'
  }
]

describe('FlTreeSelect', () => {
  it('renders with fl-tree-select class and preserves user class', () => {
    const wrapper = mount(FlTreeSelect, {
      attrs: {
        class: 'biz-tree-select',
        data: treeData
      }
    })

    const treeSelect = wrapper.get('.el-select')
    expect(treeSelect.classes()).toContain('fl-tree-select')
    expect(treeSelect.classes()).toContain('biz-tree-select')
  })

  it('passes common attrs through to ElTreeSelect', () => {
    const wrapper = mount(FlTreeSelect, {
      attrs: {
        data: treeData,
        disabled: true,
        placeholder: 'please select department'
      }
    })

    const treeSelect = wrapper.getComponent(ElTreeSelect)
    expect(treeSelect.props('data')).toEqual(treeData)
    expect(treeSelect.props('disabled')).toBe(true)
    expect(treeSelect.props('placeholder')).toBe('please select department')
  })

  it('enables clearable by default', () => {
    const wrapper = mount(FlTreeSelect, {
      attrs: {
        data: treeData
      }
    })

    expect(wrapper.getComponent(ElTreeSelect).props('clearable')).toBe(true)
  })

  it('allows overriding clearable from attrs', () => {
    const wrapper = mount(FlTreeSelect, {
      attrs: {
        clearable: false,
        data: treeData
      }
    })

    expect(wrapper.getComponent(ElTreeSelect).props('clearable')).toBe(false)
  })

  it('applies error and table state classes', async () => {
    const wrapper = mount(FlTreeSelect, {
      attrs: {
        data: treeData
      },
      props: {
        isError: false,
        isTable: false
      }
    })

    const treeSelect = wrapper.get('.el-select')
    expect(treeSelect.classes()).not.toContain('is-error')
    expect(treeSelect.classes()).not.toContain('is-table')

    await wrapper.setProps({
      isError: true,
      isTable: true
    })

    expect(treeSelect.classes()).toContain('is-error')
    expect(treeSelect.classes()).toContain('is-table')
  })

  it('clears model value immediately when isError is true', () => {
    const onUpdateModelValue = vi.fn()

    mount(FlTreeSelect, {
      attrs: {
        data: treeData,
        'onUpdate:modelValue': onUpdateModelValue
      },
      props: {
        isError: true,
        modelValue: 'frontend'
      }
    })

    expect(onUpdateModelValue).toHaveBeenCalledTimes(1)
    expect(onUpdateModelValue).toHaveBeenCalledWith(undefined)
  })

  it('clears model value when isError switches to true', async () => {
    const onUpdateModelValue = vi.fn()
    const wrapper = mount(FlTreeSelect, {
      attrs: {
        data: treeData,
        'onUpdate:modelValue': onUpdateModelValue
      },
      props: {
        isError: false,
        modelValue: 'frontend'
      }
    })

    expect(onUpdateModelValue).not.toHaveBeenCalled()

    await wrapper.setProps({ isError: true })

    expect(onUpdateModelValue).toHaveBeenCalledTimes(1)
    expect(onUpdateModelValue).toHaveBeenCalledWith(undefined)
  })

  it('uses empty array as clear payload in multiple mode', () => {
    const onUpdateModelValue = vi.fn()

    mount(FlTreeSelect, {
      attrs: {
        data: treeData,
        multiple: true,
        'onUpdate:modelValue': onUpdateModelValue
      },
      props: {
        isError: true,
        modelValue: ['frontend']
      }
    })

    expect(onUpdateModelValue).toHaveBeenCalledTimes(1)
    expect(onUpdateModelValue).toHaveBeenCalledWith([])
  })

  it('keeps original change and update:modelValue listeners working', () => {
    const onChange = vi.fn()
    const onUpdateModelValue = vi.fn()
    const wrapper = mount(FlTreeSelect, {
      attrs: {
        data: treeData,
        onChange,
        'onUpdate:modelValue': onUpdateModelValue
      }
    })

    const treeSelect = wrapper.getComponent(ElTreeSelect)
    treeSelect.vm.$emit('change', 'frontend')
    treeSelect.vm.$emit('update:modelValue', 'frontend')

    expect(onChange).toHaveBeenCalledWith('frontend')
    expect(onUpdateModelValue).toHaveBeenCalledWith('frontend')
  })

  it('passes slots through', () => {
    const wrapper = mount(FlTreeSelect, {
      attrs: {
        data: treeData
      },
      slots: {
        prefix: () => h('span', { class: 'prefix-probe' }, 'prefix')
      }
    })

    expect(wrapper.find('.prefix-probe').exists()).toBe(true)
  })

  it('forwards ElTreeSelect exposed instance methods and refs', async () => {
    const wrapper = mount(FlTreeSelect, {
      attrs: {
        data: treeData
      }
    })

    await nextTick()

    const exposed = wrapper.vm as unknown as {
      blur?: () => void
      focus?: () => void
      selectRef?: unknown
      treeRef?: unknown
    }

    expect(typeof exposed.focus).toBe('function')
    expect(typeof exposed.blur).toBe('function')
    expect(exposed.selectRef).toBeTruthy()
    expect(exposed.treeRef).toBeTruthy()
  })

  it('supports type exports from component entry', () => {
    type TypeSmoke = [TreeSelectProps, TreeSelectEmits]
    const typeSmoke: TypeSmoke | null = null

    expect(typeSmoke).toBeNull()
  })
})
