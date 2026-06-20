import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { useClearableState } from '..'

const ClearableProbe = defineComponent({
  name: 'ClearableProbe',
  props: {
    isError: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { attrs }) {
    const rawAttrs = attrs as Record<string, unknown>
    const { resolveClearable } = useClearableState({
      attrs: rawAttrs,
      isError: () => props.isError,
      resolveClearValue: () =>
        rawAttrs.multiple === true || rawAttrs.multiple === '' ? [] : undefined
    })

    return () =>
      h('div', {
        'data-clearable': String(resolveClearable())
      })
  }
})

describe('useClearableState', () => {
  it('enables clearable by default and allows explicit false override', () => {
    const defaultWrapper = mount(ClearableProbe)
    const disabledWrapper = mount(ClearableProbe, {
      attrs: {
        clearable: false
      }
    })

    expect(defaultWrapper.attributes('data-clearable')).toBe('true')
    expect(disabledWrapper.attributes('data-clearable')).toBe('false')
  })

  it('clears with undefined when error state is active in single mode', () => {
    const onUpdateModelValue = vi.fn()

    mount(ClearableProbe, {
      attrs: {
        'onUpdate:modelValue': onUpdateModelValue
      },
      props: {
        isError: true
      }
    })

    expect(onUpdateModelValue).toHaveBeenCalledTimes(1)
    expect(onUpdateModelValue).toHaveBeenCalledWith(undefined)
  })

  it('clears with an empty array when error state is active in multiple mode', () => {
    const onUpdateModelValue = vi.fn()

    mount(ClearableProbe, {
      attrs: {
        multiple: true,
        'onUpdate:modelValue': onUpdateModelValue
      },
      props: {
        isError: true
      }
    })

    expect(onUpdateModelValue).toHaveBeenCalledTimes(1)
    expect(onUpdateModelValue).toHaveBeenCalledWith([])
  })
})
