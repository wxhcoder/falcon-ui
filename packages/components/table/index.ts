import Table from './src/table.vue'
import { withInstall } from '@falcon-ui/utils'

export const FlTable = withInstall(Table)

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
