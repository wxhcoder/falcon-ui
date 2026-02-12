import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FButton from '../src/button.vue'

describe('FButton', () => {
  it('emits click when active', async () => {
    const wrapper = mount(FButton, {
      props: {
        type: 'primary'
      },
      slots: {
        default: 'Submit'
      }
    })

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('does not emit click when disabled or loading', async () => {
    const disabledWrapper = mount(FButton, {
      props: {
        disabled: true
      }
    })
    await disabledWrapper.get('button').trigger('click')
    expect(disabledWrapper.emitted('click')).toBeUndefined()

    const loadingWrapper = mount(FButton, {
      props: {
        loading: true
      }
    })
    await loadingWrapper.get('button').trigger('click')
    expect(loadingWrapper.emitted('click')).toBeUndefined()
  })
})
