import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { ElDialog } from 'element-plus'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import FlDialog from '../src/dialog.vue'

const openDialog = async (wrapper: VueWrapper, extraProps?: Record<string, unknown>) => {
  await wrapper.setProps({
    ...(extraProps || {}),
    modelValue: true
  })
  await nextTick()
  await nextTick()
}

describe('FlDialog', () => {
  it('renders ElDialog with default wrapper behavior', async () => {
    const wrapper = mount(FlDialog, {
      attrs: {
        teleported: false
      },
      props: {
        modelValue: false
      },
      slots: {
        default: 'Dialog content'
      }
    })
    await openDialog(wrapper)

    const dialog = wrapper.getComponent(ElDialog)
    expect(dialog.props('draggable')).toBe(true)
    expect(dialog.props('destroyOnClose')).toBe(true)
    expect(dialog.props('alignCenter')).toBe(true)
    expect(dialog.props('transition')).toBe('fl-dialog-bounce')
    expect(dialog.props('headerClass')).toContain('fl-dialog__header')
    expect(dialog.props('bodyClass')).toContain('fl-dialog__body')
    expect(dialog.props('footerClass')).toContain('fl-dialog__footer')
    expect(wrapper.html()).toContain('fl-dialog')
  })

  it('merges user header/body/footer class through 2.9.3 class props', () => {
    const wrapper = mount(FlDialog, {
      attrs: {
        'body-class': 'biz-body',
        'footer-class': 'biz-footer',
        'header-class': 'biz-header',
        teleported: false
      },
      props: {
        modelValue: false
      }
    })

    const dialog = wrapper.getComponent(ElDialog)
    expect(dialog.props('headerClass')).toContain('fl-dialog__header')
    expect(dialog.props('headerClass')).toContain('biz-header')
    expect(dialog.props('bodyClass')).toContain('fl-dialog__body')
    expect(dialog.props('bodyClass')).toContain('biz-body')
    expect(dialog.props('footerClass')).toContain('fl-dialog__footer')
    expect(dialog.props('footerClass')).toContain('biz-footer')
  })

  it('emits cancel and confirm before update:modelValue false', async () => {
    const events: string[] = []
    const wrapper = mount(FlDialog, {
      attrs: {
        'onUpdate:modelValue': () => events.push('update'),
        onCancel: () => events.push('cancel'),
        onConfirm: () => events.push('confirm'),
        teleported: false
      },
      props: {
        modelValue: false
      }
    })
    await openDialog(wrapper)

    const footerButtons = wrapper.findAll('.fl-dialog__footer-actions .el-button')
    await footerButtons[0].trigger('click')
    await footerButtons[1].trigger('click')

    expect(wrapper.emitted('cancel')).toBeTruthy()
    expect(wrapper.emitted('confirm')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([false])
    expect(events).toEqual(['cancel', 'update', 'confirm', 'update'])
  })

  it('uses custom footer slot instead of builtin actions', async () => {
    const wrapper = mount(FlDialog, {
      attrs: {
        teleported: false
      },
      props: {
        modelValue: false
      },
      slots: {
        footer: '<div class="custom-footer">Custom footer</div>'
      }
    })
    await openDialog(wrapper)

    expect(wrapper.find('.custom-footer').exists()).toBe(true)
    expect(wrapper.find('.fl-dialog__footer-actions').exists()).toBe(false)
  })

  it('supports bodyHeight as number or string', async () => {
    const wrapper = mount(FlDialog, {
      attrs: {
        teleported: false
      },
      props: {
        bodyHeight: 300,
        modelValue: false
      }
    })
    await openDialog(wrapper)

    expect(wrapper.get('.fl-dialog__body-inner').attributes('style')).toContain('height: 300px')
    expect(wrapper.get('.fl-dialog__body-inner').attributes('style')).toContain('overflow-y: auto')

    await wrapper.setProps({
      bodyHeight: '60vh'
    })
    await nextTick()

    expect(wrapper.get('.fl-dialog__body-inner').attributes('style')).toContain('height: 60vh')
  })

  it('toggles fullscreen internally and close button emits update:modelValue', async () => {
    const wrapper = mount(FlDialog, {
      attrs: {
        teleported: false
      },
      props: {
        modelValue: false
      }
    })
    await openDialog(wrapper)

    const dialog = wrapper.getComponent(ElDialog)
    expect(dialog.props('fullscreen')).toBe(false)

    const headerButtons = wrapper.findAll('.fl-dialog__header-actions .el-button')
    await headerButtons[0].trigger('click')
    await nextTick()
    expect(dialog.props('fullscreen')).toBe(true)

    await headerButtons[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })
})
