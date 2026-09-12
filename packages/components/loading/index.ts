import Loading from './src/FlLoading.vue'
import { withInstall } from '@falcon-ui/utils'

export const FlLoading = withInstall(Loading)
export default FlLoading
export { useFlLoading } from './src/use-fl-loading'
export type { FlLoadingOptions, FlLoadingDirectiveOptions } from './src/use-fl-loading'
export type {
  FlLoadingProps,
  FlLoadingAnimation,
  FlLoadingSize,
  FlLoadingTheme,
  FlLoadingLayout
} from './src/loading'
