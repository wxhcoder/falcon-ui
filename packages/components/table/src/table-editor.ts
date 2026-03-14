import type { ExtractPublicPropTypes, PropType, Ref } from 'vue'
import type { TableEditorMode, TableEditorTarget } from './editor-registry'

export const tableEditorProps = {
  mode: {
    type: String as PropType<TableEditorMode>,
    required: true
  },
  targetRef: {
    type: Object as PropType<Ref<TableEditorTarget>>,
    default: undefined
  },
  priority: {
    type: Number,
    default: 0
  }
} as const

export type TableEditorProps = ExtractPublicPropTypes<typeof tableEditorProps>

export type { TableEditorMode, TableEditorTarget }
