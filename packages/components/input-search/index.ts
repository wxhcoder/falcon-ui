import InputSearch from './src/input-search.vue'
import { withInstall } from '@falcon-ui/utils'

export const FlInputSearch = withInstall(InputSearch)

export default FlInputSearch

export type {
  FlInputSearchClearPayload,
  FlInputSearchEmits,
  FlInputSearchFetchApi,
  FlInputSearchMappedResult,
  FlInputSearchMapResult,
  FlInputSearchOpenDialogPayload,
  FlInputSearchOpenDialogReason,
  FlInputSearchProps,
  FlInputSearchSearchErrorPayload,
  FlInputSearchSelectionCommitPayload,
  FlInputSearchValue,
  InputSearchEmits,
  InputSearchProps
} from './src/input-search'
