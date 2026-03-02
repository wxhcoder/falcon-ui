import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import FlInputSearch from '../src/input-search.vue'

const mapResult = (item: unknown) => {
  const record = item as { id?: string | number | null; name?: string }
  return {
    value: record.id ?? null,
    label: record.name ?? ''
  }
}

describe('FlInputSearch', () => {
  it('updates label while typing and does not emit model update', async () => {
    const wrapper = mount(FlInputSearch, {
      props: {
        modelValue: null,
        label: '',
        mapResult
      }
    })

    await wrapper.get('input').setValue('ACME')

    expect(wrapper.emitted('update:label')?.at(-1)).toEqual(['ACME'])
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('does not call fetchApi when Enter is pressed with empty keyword', async () => {
    const fetchApi = vi.fn().mockResolvedValue([])
    const wrapper = mount(FlInputSearch, {
      props: {
        modelValue: null,
        label: '',
        mapResult,
        fetchApi
      }
    })

    await wrapper.get('input').trigger('keydown.enter')

    expect(fetchApi).not.toHaveBeenCalled()
  })

  it('commits single search result on Enter', async () => {
    const fetchApi = vi.fn().mockResolvedValue([{ id: 'u-1', name: 'Acme Corp' }])
    const wrapper = mount(FlInputSearch, {
      props: {
        modelValue: null,
        label: '',
        mapResult,
        fetchApi
      }
    })

    await wrapper.get('input').setValue('acme')
    await wrapper.get('input').trigger('keydown.enter')

    await Promise.resolve()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['u-1'])
    expect(wrapper.emitted('update:label')?.at(-1)).toEqual(['Acme Corp'])
    expect(wrapper.emitted('selection-commit')?.at(-1)).toEqual([
      {
        value: 'u-1',
        label: 'Acme Corp',
        source: 'enter'
      }
    ])
  })

  it('emits openDialog when search result count is greater than one', async () => {
    const fetchApi = vi.fn().mockResolvedValue([
      { id: 'u-1', name: 'Acme A' },
      { id: 'u-2', name: 'Acme B' }
    ])
    const wrapper = mount(FlInputSearch, {
      props: {
        modelValue: null,
        label: '',
        mapResult,
        fetchApi
      }
    })

    await wrapper.get('input').setValue('acme')
    await wrapper.get('input').trigger('keydown.enter')

    await Promise.resolve()

    expect(wrapper.emitted('openDialog')?.at(-1)).toEqual([
      {
        keyword: 'acme',
        reason: 'multi-match',
        results: [
          { id: 'u-1', name: 'Acme A' },
          { id: 'u-2', name: 'Acme B' }
        ]
      }
    ])
  })

  it('emits openDialog in manual mode when suffix trigger is clicked', async () => {
    const wrapper = mount(FlInputSearch, {
      props: {
        modelValue: null,
        label: 'manual',
        mapResult
      }
    })

    await wrapper.get('.fl-input-search__trigger').trigger('click')

    expect(wrapper.emitted('openDialog')?.at(-1)).toEqual([
      {
        keyword: 'manual',
        reason: 'manual'
      }
    ])
  })

  it('clears unconfirmed input on blur', async () => {
    const wrapper = mount(FlInputSearch, {
      props: {
        modelValue: 'u-1',
        label: 'Acme',
        mapResult
      }
    })

    await wrapper.get('input').setValue('Acme Changed')
    await wrapper.get('input').trigger('blur')

    expect(wrapper.emitted('clear')?.at(-1)).toEqual([{ reason: 'blur-unconfirmed' }])
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([null])
    expect(wrapper.emitted('update:label')?.at(-1)).toEqual([''])
  })

  it('adds error and table class states', () => {
    const wrapper = mount(FlInputSearch, {
      props: {
        modelValue: null,
        label: '',
        mapResult,
        isError: true,
        isTable: true
      }
    })

    expect(wrapper.find('.el-input').classes()).toContain('is-error')
    expect(wrapper.find('.el-input').classes()).toContain('is-table')
  })

  it('exposes focus, blur and clear methods', () => {
    const wrapper = mount(FlInputSearch, {
      props: {
        modelValue: null,
        label: '',
        mapResult
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
