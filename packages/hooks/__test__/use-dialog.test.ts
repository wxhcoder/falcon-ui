import { ElTable, ElTableColumn } from 'element-plus'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'
import { useDialog } from '..'

/**
 * 等待 useDialog 内部 render 与 Promise 微任务队列稳定。
 */
const flushDialog = async () => {
  await nextTick()
  await Promise.resolve()
  await nextTick()
}

/**
 * 读取默认 footer 操作按钮（取消、确认）。
 */
const getFooterButtons = () =>
  document.querySelectorAll(
    '.fl-dialog__footer-actions .el-button'
  ) as NodeListOf<HTMLButtonElement>

/**
 * 轮询等待弹窗渲染完成，避免异步挂载导致的偶发空节点。
 */
const waitForDialogReady = async () => {
  const startTime = Date.now()

  while (Date.now() - startTime < 1200) {
    await flushDialog()
    const buttons = getFooterButtons()

    if (buttons.length >= 2) {
      return buttons
    }

    await new Promise<void>((resolve) => {
      setTimeout(resolve, 16)
    })
  }

  return getFooterButtons()
}

/**
 * 点击默认 footer 的第一个按钮（取消）。
 */
const clickFirstFooterButton = async () => {
  const buttons = await waitForDialogReady()
  buttons.item(0)?.click()
}

/**
 * 点击默认 footer 的第二个按钮（确认）。
 */
const clickConfirmFooterButton = async () => {
  const buttons = await waitForDialogReady()
  buttons.item(1)?.click()
}

describe('useDialog', () => {
  /**
   * 每个用例结束后清理实例与 DOM，避免跨用例污染。
   */
  afterEach(async () => {
    useDialog().closeAll()
    await flushDialog()
    document.body.innerHTML = ''
  })

  /**
   * 验证：open 可动态挂载弹窗，点击确认后 Promise resolve 且 DOM 被回收。
   */
  it('mounts dialog dynamically and resolves when confirmed', async () => {
    const { open } = useDialog()
    const resultPromise = open({
      title: 'Dynamic Dialog',
      message: 'This dialog is opened by useDialog.'
    })
    resultPromise.catch(() => undefined)

    const buttons = await waitForDialogReady()

    expect(buttons.length).toBeGreaterThanOrEqual(2)

    await clickConfirmFooterButton()
    await flushDialog()

    await expect(resultPromise).resolves.toEqual({ action: 'confirm' })
    expect(document.body.querySelector('.fl-dialog__footer-actions')).toBeNull()
  })

  /**
   * 验证：confirm 时可通过 payloadResolver 返回业务数据到 then 分支。
   */
  it('resolves confirm payload from payloadResolver', async () => {
    const { open } = useDialog()
    const payloadResolver = vi.fn(() => [{ id: 'r-1' }, { id: 'r-2' }])
    const resultPromise = open<{ id: string }[]>({
      title: 'Payload Dialog',
      payloadResolver
    })

    await clickConfirmFooterButton()
    await flushDialog()

    await expect(resultPromise).resolves.toEqual({
      action: 'confirm',
      data: [{ id: 'r-1' }, { id: 'r-2' }]
    })
    expect(payloadResolver).toHaveBeenCalledTimes(1)
  })

  /**
   * 验证：点击取消时 Promise 走 reject 分支，动作为 cancel。
   */
  it('rejects with cancel when cancel action is triggered', async () => {
    const { open } = useDialog()
    const resultPromise = open({
      title: 'Cancel Dialog',
      message: 'Cancel me.'
    }).then(
      () => ({ action: 'resolved' as const }),
      (error) => error
    )

    await clickFirstFooterButton()
    await flushDialog()

    await expect(resultPromise).resolves.toEqual({ action: 'cancel' })
  })

  /**
   * 验证：非确认动作不会触发 payloadResolver。
   */
  it('does not call payloadResolver for non-confirm actions', async () => {
    const { open } = useDialog()
    const payloadResolver = vi.fn(() => [{ id: 'x-1' }])
    const resultPromise = open<{ id: string }[]>({
      title: 'Cancel Without Payload',
      payloadResolver
    }).then(
      () => ({ action: 'resolved' as const }),
      (error) => error
    )

    await clickFirstFooterButton()
    await flushDialog()

    await expect(resultPromise).resolves.toEqual({ action: 'cancel' })
    expect(payloadResolver).not.toHaveBeenCalled()
  })

  /**
   * 验证：非确认动作不会触发 payloadMethod。
   */
  it('does not call payloadMethod for non-confirm actions', async () => {
    const { open } = useDialog()
    const resultPromise = open({
      title: 'Cancel Without Payload Method',
      message: () => h('div', 'payload'),
      payloadMethod: 'collect'
    }).then(
      () => ({ action: 'resolved' as const }),
      (error) => error
    )

    await clickFirstFooterButton()
    await flushDialog()

    await expect(resultPromise).resolves.toEqual({ action: 'cancel' })
  })

  /**
   * 验证：beforeClose 返回 false 时阻止关闭，closeAll 仍可强制关闭。
   */
  it('prevents close when beforeClose returns false', async () => {
    const beforeClose = vi.fn(async (action: string) => action !== 'confirm')
    const { open, closeAll } = useDialog()
    const settledSpy = vi.fn()
    const resultPromise = open({
      title: 'Block Confirm',
      beforeClose
    })

    resultPromise.then(settledSpy).catch(settledSpy)

    await flushDialog()
    await clickConfirmFooterButton()
    await flushDialog()

    expect(beforeClose).toHaveBeenCalledWith('confirm')
    expect(document.body.querySelector('.fl-dialog')).not.toBeNull()
    expect(settledSpy).not.toHaveBeenCalled()

    closeAll()
    await flushDialog()
    await expect(resultPromise).rejects.toEqual({ action: 'closeAll' })
  })

  /**
   * 验证：连续 open 时旧实例按 closeAll 关闭，新实例可正常工作。
   */
  it('closes previous instance when open is called again', async () => {
    const { open } = useDialog()
    const firstResult = open({
      title: 'First Dialog'
    }).then(
      () => ({ action: 'resolved' as const }),
      (error) => error
    )

    await flushDialog()

    const secondResult = open({
      title: 'Second Dialog'
    })

    await flushDialog()

    await expect(firstResult).resolves.toEqual({ action: 'closeAll' })

    await clickConfirmFooterButton()
    await flushDialog()
    await expect(secondResult).resolves.toEqual({ action: 'confirm' })
  })

  /**
   * 验证：无活动实例时调用 closeAll 不抛错。
   */
  it('closeAll does nothing when there is no active dialog', () => {
    const { closeAll } = useDialog()
    expect(() => closeAll()).not.toThrow()
  })

  /**
   * 验证：appendTo 非法时回退到 document.body 挂载。
   */
  it('falls back to document.body when appendTo is invalid', async () => {
    const { open } = useDialog()
    const resultPromise = open({
      appendTo: '#unknown-container',
      title: 'Fallback Append Target'
    })

    await flushDialog()
    expect(document.body.querySelector('.fl-dialog')).not.toBeNull()

    await clickFirstFooterButton()
    await flushDialog()
    await expect(resultPromise).rejects.toEqual({ action: 'cancel' })
  })

  /**
   * 验证：payloadResolver 抛错时 Promise 透传异常并清理实例。
   */
  it('rejects with payloadResolver error when resolver throws on confirm', async () => {
    const { open } = useDialog()
    const payloadError = new Error('payload failed')
    const resultPromise = open({
      title: 'Payload Error',
      payloadResolver: () => {
        throw payloadError
      }
    })

    await clickConfirmFooterButton()
    await flushDialog()

    await expect(resultPromise).rejects.toBe(payloadError)
    expect(document.body.querySelector('.fl-dialog__footer-actions')).toBeNull()
  })

  /**
   * 验证：支持链式 then/catch 风格，confirm 进 then、cancel 进 catch。
   */
  it('supports then/catch style for confirm and cancel actions', async () => {
    const dialog = useDialog()

    const confirmThen = vi.fn()
    const confirmCatch = vi.fn()
    const confirmChain = dialog
      .open({
        title: 'Chain Confirm',
        payloadResolver: () => ({ selectedRowIds: ['1001', '1002'] })
      })
      .then(({ data }) => {
        confirmThen(data)
      })
      .catch((error) => {
        confirmCatch(error)
      })

    await clickConfirmFooterButton()
    await flushDialog()
    await confirmChain

    expect(confirmThen).toHaveBeenCalledTimes(1)
    expect(confirmThen).toHaveBeenCalledWith({ selectedRowIds: ['1001', '1002'] })
    expect(confirmCatch).not.toHaveBeenCalled()

    const cancelThen = vi.fn()
    const cancelCatch = vi.fn()
    const cancelChain = dialog
      .open({
        title: 'Chain Cancel'
      })
      .then(() => {
        cancelThen()
      })
      .catch(({ action }) => {
        cancelCatch(action)
      })

    await clickFirstFooterButton()
    await flushDialog()
    await cancelChain

    expect(cancelThen).not.toHaveBeenCalled()
    expect(cancelCatch).toHaveBeenCalledWith('cancel')
  })

  /**
   * 验证：useDialog 渲染 ElTable 时，可通过 payloadMethod + then 获取勾选行。
   */
  it('returns selected rows from ElTable via payloadMethod and then callback', async () => {
    type TableRow = {
      id: string
      name: string
    }

    type ElTableExpose = {
      getSelectionRows: () => TableRow[]
      toggleRowSelection: (row: TableRow, selected?: boolean) => void
    }

    const tableData: TableRow[] = [
      { id: 'u-1', name: 'Alice' },
      { id: 'u-2', name: 'Bob' }
    ]

    const dialog = useDialog()
    const thenSpy = vi.fn()
    const catchSpy = vi.fn()
    let toggleRowSelection: ElTableExpose['toggleRowSelection'] | undefined

    const chain = dialog
      .open<TableRow[]>({
        title: 'ElTable Selection',
        message: () =>
          h(
            ElTable,
            {
              data: tableData,
              border: true,
              height: 200,
              onVnodeMounted: (vnode) => {
                const tableExpose =
                  (vnode.component?.proxy as unknown as ElTableExpose | null) ?? null
                toggleRowSelection = tableExpose?.toggleRowSelection.bind(tableExpose)
              }
            },
            () => [
              h(ElTableColumn, { type: 'selection', width: 52 }),
              h(ElTableColumn, { label: 'ID', prop: 'id', width: 100 }),
              h(ElTableColumn, { label: 'Name', prop: 'name' })
            ]
          ),
        payloadMethod: 'getSelectionRows'
      })
      .then((data) => {
        // 获取到选中的数据
        thenSpy(data)
      })
      .catch((error) => {
        catchSpy(error)
      })

    await waitForDialogReady()
    await flushDialog()
    toggleRowSelection?.(tableData[0], true)
    await flushDialog()

    await clickConfirmFooterButton()
    await flushDialog()
    await chain

    expect(thenSpy).toHaveBeenCalledTimes(1)
    expect(thenSpy).toHaveBeenCalledWith({
      action: 'confirm',
      data: [tableData[0]]
    })
    expect(catchSpy).not.toHaveBeenCalled()
  })

  /**
   * 验证：payloadMethod 指向不存在的方法时会 reject Error。
   */
  it('rejects error when payloadMethod is not a function on payload target', async () => {
    const { open } = useDialog()
    const resultPromise = open({
      title: 'Method Missing',
      message: () =>
        h(
          ElTable,
          {
            data: [{ id: 'u-1', name: 'Alice' }],
            border: true,
            height: 200
          },
          () => [
            h(ElTableColumn, { type: 'selection', width: 52 }),
            h(ElTableColumn, { label: 'ID', prop: 'id', width: 100 }),
            h(ElTableColumn, { label: 'Name', prop: 'name' })
          ]
        ),
      payloadMethod: 'notExistingMethod'
    })

    await clickConfirmFooterButton()
    await flushDialog()

    await expect(resultPromise).rejects.toThrow(
      '[useDialog] payload method "notExistingMethod" is not a function.'
    )
  })

  /**
   * 验证：当 payloadResolver 与 payloadMethod 同时存在时，优先执行 payloadResolver。
   */
  it('prefers payloadResolver over payloadMethod when both are provided', async () => {
    const payloadResolver = vi.fn(() => ['from-resolver'])

    const { open } = useDialog()
    const resultPromise = open<string[]>({
      title: 'Resolver Priority',
      message: () => h('div', 'payload'),
      payloadMethod: 'collect',
      payloadResolver
    })

    await clickConfirmFooterButton()
    await flushDialog()

    await expect(resultPromise).resolves.toEqual({
      action: 'confirm',
      data: ['from-resolver']
    })
    expect(payloadResolver).toHaveBeenCalledTimes(1)
  })
})
