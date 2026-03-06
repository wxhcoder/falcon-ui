import DatePicker from './src/date-picker.vue'
import { withInstall } from '@falcon-ui/utils'

export const FlDatePicker = withInstall(DatePicker)

export default FlDatePicker

export type {
  DatePickerEmits,
  DatePickerProps,
  FlDatePickerEmits,
  FlDatePickerProps
} from './src/date-picker'

