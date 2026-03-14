import Table from './src/table.vue'
import TableEditor from './src/table-editor.vue'
import { withInstall } from '@falcon-ui/utils'

export const FlTable = withInstall(Table)
export const FlTableEditor = withInstall(TableEditor)

export default FlTable

export type {
  CellChangeEvent,
  ColumnDragEvent,
  ColumnOrderChangeEvent,
  EmitTrigger,
  RowData,
  RowDragEvent,
  RowOrderChangeEvent,
  SelectionRowToggleEvent,
  SelectionSingleConflictEvent,
  TableEmits,
  TableProps
} from './src/table'
export type { TableEditorMode, TableEditorProps } from './src/table-editor'
