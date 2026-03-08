import Table from './src/table.vue'
import { withInstall } from '@falcon-ui/utils'

export const FlTable = withInstall(Table)

export default FlTable

export type {
  FlTableCellChangePayload,
  FlTableColumnDragPayload,
  FlTableColumnOrderChangePayload,
  FlTableEmits,
  FlTableProps,
  FlTableRowData,
  FlTableRowDragPayload,
  FlTableRowOrderChangePayload,
  FlTableSelectionRowTogglePayload,
  FlTableSelectionSingleConflictPayload,
  TableEmits,
  TableProps
} from './src/table'
