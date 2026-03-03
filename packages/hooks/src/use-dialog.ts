// 复用 FlDialog 的公开 props 类型，保证调用式服务与组件 props 契约一致。
import type { FlDialogProps } from '../../components/dialog/src/dialog'
// 支持通过字符串、VNode 或渲染函数提供弹窗内容。
import type { Ref, VNode } from 'vue'
// 调用式弹窗通过运行时动态创建 VNode 并手动渲染/销毁。
import { cloneVNode, createVNode, defineComponent, h, isVNode, ref, render } from 'vue'

// useDialog 支持的所有动作类型。
export type DialogAction = 'confirm' | 'cancel' | 'close' | 'mask' | 'esc' | 'closeAll'
// closeAll 的原因类型与动作类型保持一致。
export type DialogCloseReason = DialogAction

// Promise resolve 分支的载荷，仅 confirm 会进入 resolve。
export type DialogResolvePayload<TPayload = void> = TPayload extends void
  ? { action: 'confirm' }
  : { action: 'confirm'; data: TPayload }

// Promise reject 分支动作（排除 confirm）。
export type DialogRejectAction = Exclude<DialogAction, 'confirm'>

// Promise reject 分支的载荷结构。
export interface DialogRejectPayload {
  action: DialogRejectAction
}

// 关闭前拦截钩子：返回 false 则阻止关闭。
export type DialogBeforeClose = (action: DialogAction) => boolean | Promise<boolean>
// 确认动作的数据解析器。
export type DialogPayloadResolver<TPayload> = () => TPayload | Promise<TPayload>
// 确认动作通过组件实例方法读取数据的方法名。
export type DialogPayloadMethod = string
// 弹窗正文支持的消息类型。
export type DialogMessage = string | VNode | (() => VNode)

// open 方法参数。
export interface DialogOpenOptions<TPayload = void> {
  // 标题。
  title?: string
  // 正文内容。
  message?: DialogMessage
  // 挂载目标，非法时回退到 document.body。
  appendTo?: string | HTMLElement
  // 是否显示右上角关闭按钮。
  showClose?: boolean
  // 是否允许点击遮罩关闭。
  closeOnClickModal?: boolean
  // 是否允许按 ESC 关闭。
  closeOnPressEscape?: boolean
  // 关闭前拦截。
  beforeClose?: DialogBeforeClose
  // 透传给 FlDialog 的额外参数（内部托管字段会被过滤）。
  dialogProps?: Partial<FlDialogProps> & Record<string, unknown>
  // 确认时读取业务数据并返回到 then 回调。
  payloadResolver?: DialogPayloadResolver<TPayload>
  // 确认时自动从 message 对应组件实例调用的方法名。
  payloadMethod?: DialogPayloadMethod
  // 调用 payloadMethod 时透传的参数列表。
  payloadMethodArgs?: unknown[]
  // 弹窗最终关闭时的动作回调。
  onAction?: (action: DialogAction) => void
}

// useDialog 对外暴露的服务接口。
export interface UseDialogService {
  // 打开弹窗，confirm resolve，其余动作 reject。
  open: <TPayload = void>(
    options?: DialogOpenOptions<TPayload>
  ) => Promise<DialogResolvePayload<TPayload>>
  // 关闭当前活动实例。
  closeAll: (reason?: DialogCloseReason) => void
}

// 动态导入 .vue 组件后的类型。
type DialogComponent = ReturnType<typeof defineComponent>

// 当前活动实例元信息，用于单例控制与关闭。
type ActiveDialogInstance = {
  // 主动关闭当前实例。
  close: (reason?: DialogCloseReason) => void
  // 实例唯一 id，用于避免旧实例清理误伤新实例。
  id: number
}

// 支持从组件 VNode 自动注入 ref 的 shapeFlag（有状态/函数式组件）。
const componentVNodeShapeFlag = 4 | 2

// 这些字段由服务层统一管理，禁止调用方在 dialogProps 里覆盖。
const managedDialogPropKeys = new Set([
  'modelValue',
  'title',
  'showClose',
  'closeOnClickModal',
  'closeOnPressEscape',
  'onCancel',
  'onConfirm',
  'onUpdate:modelValue',
  'onUpdateModelValue'
])

// 当前活动实例引用（单例）。
let activeDialogInstance: ActiveDialogInstance | null = null
// 自增实例 id 种子。
let dialogSeed = 0
// 懒加载缓存，避免重复动态导入对话框组件。
let dialogComponentLoader: Promise<DialogComponent> | null = null

/**
 * [04] 懒加载 FlDialog 组件并进行缓存。
 */
const loadDialogComponent = async (): Promise<DialogComponent> => {
  if (!dialogComponentLoader) {
    // 仅首次调用时执行动态导入。
    dialogComponentLoader = import('../../components/dialog/src/dialog.vue').then(
      (module) => module.default as DialogComponent
    )
  }

  return dialogComponentLoader
}

/**
 * 将任意动作映射到 reject 分支动作。
 * 理论上 confirm 不会走 reject，这里兜底转换为 close。
 */
const toDialogRejectAction = (action: DialogAction): DialogRejectAction =>
  action === 'confirm' ? 'close' : action

/**
 * [03] 解析挂载容器，优先使用 appendTo，失败回退到 document.body。
 */
const resolveAppendTarget = (appendTo?: string | HTMLElement): HTMLElement => {
  // 首版仅支持浏览器运行时。
  if (typeof document === 'undefined') {
    throw new Error('[useDialog] document is not available in current runtime.')
  }

  // 直接传入 DOM 节点时直接使用。
  if (appendTo instanceof HTMLElement) {
    return appendTo
  }

  // 传入选择器时尝试查询目标节点。
  if (typeof appendTo === 'string') {
    const node = document.querySelector(appendTo)
    if (node instanceof HTMLElement) {
      return node
    }
  }

  return document.body
}

/**
 * 过滤 dialogProps，移除由服务层托管的字段。
 */
const sanitizeDialogProps = (
  dialogProps?: Partial<FlDialogProps> & Record<string, unknown>
): Record<string, unknown> => {
  if (!dialogProps) {
    return {}
  }

  const nextProps: Record<string, unknown> = {}

  // 仅保留允许透传的字段。
  for (const [key, value] of Object.entries(dialogProps)) {
    if (!managedDialogPropKeys.has(key)) {
      nextProps[key] = value
    }
  }

  return nextProps
}

/**
 * 解析 message：若为函数则执行得到 VNode/字符串。
 */
const resolveMessageContent = (message?: DialogMessage) => {
  if (typeof message === 'function') {
    return message()
  }

  return message
}

/**
 * 判断当前 VNode 是否为组件。
 */
const isComponentVNode = (value: unknown): value is VNode => {
  if (!isVNode(value)) {
    return false
  }

  return (value.shapeFlag & componentVNodeShapeFlag) !== 0
}

/**
 * 若 message 是组件 VNode，则自动注入内部 payloadTargetRef。
 */
const injectPayloadTargetRef = (
  messageContent: unknown,
  payloadTargetRef: Ref<Record<string, unknown> | null>
) => {
  if (!isComponentVNode(messageContent)) {
    return messageContent
  }

  // mergeRef=true：保留调用方已有 ref，同时附加内部 payloadTargetRef。
  return cloneVNode(
    messageContent,
    {
      ref: payloadTargetRef
    },
    true
  )
}

/**
 * 通过 payloadMethod 从 message 组件实例读取确认数据。
 */
const resolvePayloadByMethod = async <TPayload>(
  options: DialogOpenOptions<TPayload>,
  payloadTargetRef: Ref<Record<string, unknown> | null>
) => {
  const payloadMethod = options.payloadMethod
  if (!payloadMethod) {
    return undefined as TPayload
  }

  const targetInstance = payloadTargetRef.value
  if (!targetInstance) {
    throw new Error(`[useDialog] payload target is not available for method "${payloadMethod}".`)
  }

  const method = targetInstance[payloadMethod]
  if (typeof method !== 'function') {
    throw new Error(`[useDialog] payload method "${payloadMethod}" is not a function.`)
  }

  return (await method(...(options.payloadMethodArgs ?? []))) as TPayload
}

/**
 * 执行 confirm 数据解析，作为 then 分支的 data。
 * 优先级：payloadResolver > payloadMethod。
 */
const resolveConfirmPayload = async <TPayload>(
  options: DialogOpenOptions<TPayload>,
  payloadTargetRef: Ref<Record<string, unknown> | null>
) => {
  if (options.payloadResolver) {
    return await options.payloadResolver()
  }

  if (options.payloadMethod) {
    return await resolvePayloadByMethod(options, payloadTargetRef)
  }

  return undefined as TPayload
}

/**
 * [05] 执行 beforeClose 拦截逻辑。
 * - 未提供 beforeClose：允许关闭
 * - 返回 false：阻止关闭
 * - beforeClose 抛错：按阻止关闭处理，避免异常导致状态错乱
 */
const resolveBeforeClose = async (
  beforeClose: DialogBeforeClose | undefined,
  action: DialogAction
) => {
  if (!beforeClose) {
    return true
  }

  try {
    const result = await beforeClose(action)
    return result !== false
  } catch {
    return false
  }
}

/**
 * [02] 打开调用式弹窗。
 */
const open = <TPayload = void>(
  options: DialogOpenOptions<TPayload> = {}
): Promise<DialogResolvePayload<TPayload>> => {
  // 单例覆盖策略：打开新实例前先关闭旧实例。
  activeDialogInstance?.close('closeAll')

  // 创建挂载容器并插入目标节点。
  const appendTarget = resolveAppendTarget(options.appendTo)
  const container = document.createElement('div')
  appendTarget.appendChild(container)

  // 生成当前实例唯一 id。
  const instanceId = ++dialogSeed

  return new Promise<DialogResolvePayload<TPayload>>((resolve, reject) => {
    // 防止 Promise 重复 settle。
    let isSettled = false
    // 防止异步结算期间重复进入 settle。
    let isSettling = false
    // beforeClose 拦截 cancel/confirm 后，忽略其后跟随的一次 modelValue=false。
    let skipNextModelUpdate = false
    // 记录 footer 行为，以便在 update:modelValue 时还原为正确 action。
    let pendingModelUpdateAction: DialogAction | null = null
    // message 组件实例引用（用于 payloadMethod 自动调用）。
    const payloadTargetRef = ref<Record<string, unknown> | null>(null)

    /**
     * 卸载 VNode、移除容器并清理活动实例引用。
     */
    const cleanup = () => {
      render(null, container)
      container.remove()

      // 仅当当前实例仍是活动实例时才清空引用，防止误清理新实例。
      if (activeDialogInstance?.id === instanceId) {
        activeDialogInstance = null
      }
    }

    /**
     * 最终结算 Promise 并执行资源清理。
     */
    const settle = async (action: DialogAction) => {
      if (isSettled || isSettling) {
        return
      }

      isSettling = true

      try {
        // confirm 进入 resolve，其他动作进入 reject。
        if (action === 'confirm') {
          const payload = await resolveConfirmPayload(options, payloadTargetRef)
          if (isSettled) {
            return
          }

          isSettled = true
          // 通知调用方最终动作。
          options.onAction?.(action)

          if (payload === undefined) {
            resolve({ action: 'confirm' } as DialogResolvePayload<TPayload>)
          } else {
            resolve({ action: 'confirm', data: payload } as DialogResolvePayload<TPayload>)
          }
        } else {
          isSettled = true
          // 通知调用方最终动作。
          options.onAction?.(action)
          reject({ action: toDialogRejectAction(action) })
        }

        cleanup()
      } catch (error) {
        // payloadResolver 异常走 reject(error)，便于业务定位错误原因。
        isSettled = true
        cleanup()
        reject(error)
      } finally {
        isSettling = false
      }
    }

    /**
     * 尝试关闭弹窗。
     * force=true 时跳过 beforeClose（用于 closeAll 强制关闭）。
     */
    const requestClose = async (action: DialogAction, force = false) => {
      if (isSettled) {
        return
      }

      if (!force) {
        const canClose = await resolveBeforeClose(options.beforeClose, action)
        if (!canClose) {
          // cancel/confirm 来自 footer 点击，FlDialog 仍会触发 modelValue=false。
          // 为避免在拦截后被 onUpdate:modelValue 二次关闭，这里标记跳过一次。
          skipNextModelUpdate = action === 'cancel' || action === 'confirm'
          return
        }
      }

      void settle(action)
    }

    // 内置取消按钮事件。
    const handleCancel = () => {
      pendingModelUpdateAction = 'cancel'
      void requestClose('cancel')
    }

    // 内置确认按钮事件。
    const handleConfirm = () => {
      pendingModelUpdateAction = 'confirm'
      void requestClose('confirm')
    }

    // 监听 FlDialog 的 modelValue 变化，用于识别 close/mask/esc 等关闭动作。
    const handleModelValueUpdate = (value: boolean) => {
      // 仅关心关闭场景（false）。
      if (value || isSettled) {
        return
      }

      // 跳过一次由拦截后的 footer 自动触发的 update。
      if (skipNextModelUpdate) {
        skipNextModelUpdate = false
        pendingModelUpdateAction = null
        return
      }

      // 优先使用 footer 记录的动作；否则按通用 close 处理。
      const action = pendingModelUpdateAction ?? 'close'
      pendingModelUpdateAction = null
      void requestClose(action)
    }

    // 注册当前活动实例，供后续 closeAll / open 覆盖调用。
    activeDialogInstance = {
      id: instanceId,
      close: (reason = 'closeAll') => {
        // 主动关闭时强制执行，不经过 beforeClose。
        void requestClose(reason, true)
      }
    }

    // 异步加载组件后渲染弹窗。
    void loadDialogComponent()
      .then((DialogComponent) => {
        // 若在组件加载完成前已 settle，则不再渲染。
        if (isSettled) {
          return
        }

        // 轻量 wrapper：仅负责桥接 service 状态到 FlDialog。
        const Wrapper = defineComponent({
          name: 'FlDialogServiceWrapper',
          setup() {
            // 过滤冲突 props。
            const safeDialogProps = sanitizeDialogProps(options.dialogProps)

            return () => {
              // 在 render 阶段解析 message，确保 VNode ref 拥有正确 owner context。
              const messageContent = resolveMessageContent(options.message)
              const injectedMessageContent = injectPayloadTargetRef(
                messageContent,
                payloadTargetRef
              )

              return h(
                DialogComponent,
                {
                  ...safeDialogProps,
                  modelValue: true,
                  title: options.title,
                  showClose: options.showClose ?? true,
                  closeOnClickModal: options.closeOnClickModal ?? true,
                  closeOnPressEscape: options.closeOnPressEscape ?? true,
                  // service 场景默认不使用 teleport，便于可控挂载到 appendTo 容器。
                  teleported: safeDialogProps.teleported ?? false,
                  onCancel: handleCancel,
                  onConfirm: handleConfirm,
                  'onUpdate:modelValue': handleModelValueUpdate
                },
                injectedMessageContent === undefined
                  ? undefined
                  : { default: () => [injectedMessageContent] }
              )
            }
          }
        })

        // 将 wrapper 渲染到动态容器。
        render(createVNode(Wrapper), container)
      })
      .catch((error) => {
        // 异步加载失败时走 reject，并清理资源。
        if (isSettled) {
          return
        }

        isSettled = true
        cleanup()
        reject(error)
      })
  })
}

/**
 * [06] 关闭当前活动实例（无实例时无副作用）。
 */
const closeAll: UseDialogService['closeAll'] = (reason = 'closeAll') => {
  activeDialogInstance?.close(reason)
}

/**
 * [01] useDialog 入口：返回调用式弹窗服务。
 */
const useDialog = (): UseDialogService => ({
  open,
  closeAll
})

// 同时导出函数与组合式入口，方便按需使用。
export { closeAll, open, useDialog }
