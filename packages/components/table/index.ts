import Table from './src/table.vue'
import TableEditor from './src/table-editor.vue'
import { withInstall } from '@falcon-ui/utils'
import type { SFCWithInstall } from '@falcon-ui/utils'

export const FlTable: SFCWithInstall<typeof Table> = withInstall(Table)
export const FlTableEditor: SFCWithInstall<typeof TableEditor> = withInstall(TableEditor)

export default FlTable

export type {
  CellChangeEvent,
  ColumnDragEvent,
  ColumnOrderChangeEvent,
  EmitTrigger,
  FlTableExpose,
  RowData,
  RowDragEvent,
  RowOrderChangeEvent,
  SelectionRowToggleEvent,
  SelectionSingleConflictEvent,
  TableExpose,
  TableEmits,
  TableProps
} from './src/table'
export type { TableEditorMode, TableEditorProps } from './src/table-editor'
