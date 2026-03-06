import type { ExtractPublicPropTypes, PropType } from 'vue'

export type FlInputSearchValue = string | number | null

export interface FlInputSearchMappedResult {
  label: string
  value: FlInputSearchValue
}

export type FlInputSearchFetchApi = (keyword: string) => Promise<unknown[]>
export type FlInputSearchMapResult = (item: unknown) => FlInputSearchMappedResult

export const flInputSearchProps = {
  /**
   * 绑定值，通常为业务实体 ID。
   */
  modelValue: {
    type: [String, Number] as PropType<string | number | null>,
    default: null
  },
  /**
   * 输入框显示值（业务标签）。
   */
  label: {
    type: String,
    default: ''
  },
  /**
   * 回车检索方法。
   */
  fetchApi: {
    type: Function as PropType<FlInputSearchFetchApi>,
    default: undefined
  },
  /**
   * 外部结果映射方法，统一映射到 value/label。
   */
  mapResult: {
    type: Function as PropType<FlInputSearchMapResult>,
    required: true
  },
  /**
   * 占位提示文案。
   */
  placeholder: {
    type: String,
    default: ''
  },
  /**
   * 是否禁用输入。
   */
  disabled: {
    type: Boolean,
    default: false
  },
  /**
   * 是否显示清空按钮。
   */
  clearable: {
    type: Boolean,
    default: false
  },
  /**
   * 是否进入错误态。
   */
  isError: {
    type: Boolean,
    default: false
  },
  /**
   * 是否用于表格单元格输入。
   */
  isTable: {
    type: Boolean,
    default: false
  },
  /**
   * Blur 时未确认输入是否强制清空。
   */
  clearOnBlurUnconfirmed: {
    type: Boolean,
    default: true
  }
} as const

export type FlInputSearchOpenDialogReason = 'manual' | 'multi-match'

export interface FlInputSearchOpenDialogPayload {
  keyword: string
  reason: FlInputSearchOpenDialogReason
  results?: unknown[]
}

export interface FlInputSearchSelectionCommitPayload {
  label: string
  source: 'enter'
  value: FlInputSearchValue
}

export interface FlInputSearchSearchErrorPayload {
  error: unknown
  keyword: string
}

export interface FlInputSearchClearPayload {
  reason: 'manual-empty' | 'blur-unconfirmed' | 'error'
}

export const flInputSearchEmits = {
  /**
   * 绑定值更新事件。
   */
  'update:modelValue': (value: FlInputSearchValue) =>
    value === null || typeof value === 'string' || typeof value === 'number',
  /**
   * 显示值更新事件。
   */
  'update:label': (value: string) => typeof value === 'string',
  /**
   * 触发外部弹窗占位事件。
   */
  openDialog: (payload: FlInputSearchOpenDialogPayload) =>
    typeof payload.keyword === 'string' &&
    (payload.reason === 'manual' || payload.reason === 'multi-match') &&
    (payload.results === undefined || Array.isArray(payload.results)),
  /**
   * 唯一结果选中提交事件。
   */
  'selection-commit': (payload: FlInputSearchSelectionCommitPayload) =>
    typeof payload.label === 'string' &&
    payload.source === 'enter' &&
    (payload.value === null ||
      typeof payload.value === 'string' ||
      typeof payload.value === 'number'),
  /**
   * 回车检索失败事件。
   */
  'search-error': (payload: FlInputSearchSearchErrorPayload) => typeof payload.keyword === 'string',
  /**
   * 清空行为事件。
   */
  clear: (payload: FlInputSearchClearPayload) =>
    payload.reason === 'manual-empty' ||
    payload.reason === 'blur-unconfirmed' ||
    payload.reason === 'error'
} as const

export type FlInputSearchProps = ExtractPublicPropTypes<typeof flInputSearchProps>
export type FlInputSearchEmits = typeof flInputSearchEmits

export type InputSearchProps = FlInputSearchProps
export type InputSearchEmits = FlInputSearchEmits
