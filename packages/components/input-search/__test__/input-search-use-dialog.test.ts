import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { useDialog } from '@falcon-ui/hooks'
import type { FlInputSearchOpenDialogPayload } from '../src/input-search'
import FlInputSearch from '../src/input-search.vue'

const useDialogOpenMock = vi.fn()

vi.mock('@falcon-ui/hooks', () => ({
  useDialog: () => ({
    open: useDialogOpenMock,
    closeAll: vi.fn()
  })
}))

const mapResult = (item: unknown) => {
  const record = item as { id?: string | number | null; name?: string }
  return {
    value: record.id ?? null,
    label: record.name ?? ''
  }
}

type SearchRow = {
  id: string
  name: string
}

const createConsumerWrapper = (fetchApi?: (keyword: string) => Promise<unknown[]>) =>
  defineComponent({
    name: 'InputSearchDialogConsumer',
    setup() {
      const modelValue = ref<string | number | null>(null)
      const label = ref('')
      const dialog = useDialog()

      const handleOpenDialog = (payload: FlInputSearchOpenDialogPayload) => {
        const dialogRows: SearchRow[] =
          payload.results?.map((item) => {
            const row = item as SearchRow
            return {
              id: row.id,
              name: row.name
            }
          }) ?? []

        void dialog
          .open<SearchRow[]>({
            title: 'FlInputSearch 多结果处理',
            message: () => h('table', { 'data-count': String(dialogRows.length) }),
            payloadMethod: 'getSelectionRows'
          })
          .then(({ data }) => {
            const firstRow = data[0]
            if (!firstRow) {
              return
            }

            modelValue.value = firstRow.id
            label.value = firstRow.name
          })
          .catch(() => {})
      }

      return () =>
        h(FlInputSearch, {
          clearable: true,
          fetchApi,
          label: label.value,
          mapResult,
          modelValue: modelValue.value,
          onOpenDialog: handleOpenDialog,
          'onUpdate:label': (value: string) => {
            label.value = value
          },
          'onUpdate:modelValue': (value: string | number | null) => {
            modelValue.value = value
          }
        })
    }
  })

describe('FlInputSearch useDialog integration', () => {
  beforeEach(() => {
    useDialogOpenMock.mockReset()
    useDialogOpenMock.mockRejectedValue({ action: 'close' })
  })

  it('calls useDialog.open when manual openDialog event is emitted', async () => {
    const wrapper = mount(createConsumerWrapper())

    await wrapper.get('.fl-input-search__trigger').trigger('click')

    expect(useDialogOpenMock).toHaveBeenCalledTimes(1)
    expect(useDialogOpenMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'FlInputSearch 多结果处理',
        payloadMethod: 'getSelectionRows',
        message: expect.any(Function)
      })
    )
  })

  it('passes multi-match payload to useDialog.open content', async () => {
    const fetchApi = vi.fn().mockResolvedValue([
      { id: 'u-1', name: 'Acme A' },
      { id: 'u-2', name: 'Acme B' }
    ])
    const wrapper = mount(createConsumerWrapper(fetchApi))

    await wrapper.get('input').setValue('acme')
    await wrapper.get('input').trigger('keydown.enter')
    await Promise.resolve()

    expect(useDialogOpenMock).toHaveBeenCalledTimes(1)
    expect(useDialogOpenMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'FlInputSearch 多结果处理',
        payloadMethod: 'getSelectionRows',
        message: expect.any(Function)
      })
    )
  })

  it('refills modelValue and label from selected rows resolved by useDialog', async () => {
    useDialogOpenMock.mockResolvedValueOnce({
      action: 'confirm',
      data: [{ id: 'u-2', name: 'Acme B' }]
    })

    const fetchApi = vi.fn().mockResolvedValue([
      { id: 'u-1', name: 'Acme A' },
      { id: 'u-2', name: 'Acme B' }
    ])
    const wrapper = mount(createConsumerWrapper(fetchApi))

    await wrapper.get('input').setValue('acme')
    await wrapper.get('input').trigger('keydown.enter')
    await flushPromises()

    const inputSearch = wrapper.getComponent(FlInputSearch)
    expect(inputSearch.props('modelValue')).toBe('u-2')
    expect(inputSearch.props('label')).toBe('Acme B')
  })
})
