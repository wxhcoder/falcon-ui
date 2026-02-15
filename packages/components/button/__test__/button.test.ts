import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import FButton from '../src/button.vue'

describe('FButton', () => {
  it('renders Element Plus button by default and forwards listeners', async () => {
    const clicked = vi.fn()

    const wrapper = mount(FButton, {
      attrs: {
        onClick: clicked,
        type: 'primary'
      },
      props: {
        debugLabel: 'button-probe',
        debugMode: true
      },
      slots: {
        default: 'Submit'
      }
    })

    expect(wrapper.get('button').classes()).toContain('el-button')
    expect(wrapper.get('button').classes()).toContain('f-button')

    await wrapper.get('button').trigger('click')
    expect(clicked).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('debug-click')?.[0]).toEqual([{ label: 'button-probe' }])
  })

  it('forwards icon slot to ElButton', () => {
    const wrapper = mount(FButton, {
      slots: {
        default: 'Action',
        icon: () => 'I'
      }
    })

    expect(wrapper.text()).toContain('I')
    expect(wrapper.text()).toContain('Action')
  })
})
