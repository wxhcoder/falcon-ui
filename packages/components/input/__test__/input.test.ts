import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FInput from '../src/input.vue'

describe('FInput', () => {
  it('emits update:modelValue and input on typing', async () => {
    const wrapper = mount(FInput, {
      props: {
        modelValue: ''
      }
    })

    await wrapper.get('input').setValue('hello')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['hello'])
    expect(wrapper.emitted('input')?.[0]).toEqual(['hello'])
  })

  it('clears value when clear button is clicked', async () => {
    const wrapper = mount(FInput, {
      props: {
        modelValue: 'value',
        clearable: true
      }
    })

    await wrapper.get('.f-input__clear').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([''])
    expect(wrapper.emitted('input')?.[0]).toEqual([''])
    expect(wrapper.emitted('change')?.[0]).toEqual([''])
  })
})
