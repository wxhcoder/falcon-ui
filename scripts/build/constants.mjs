import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const currentFileDir = fileURLToPath(new URL('.', import.meta.url))
const rootDir = resolve(currentFileDir, '..', '..')
const packagesDir = resolve(rootDir, 'packages')
const distDir = resolve(rootDir, 'dist')
const distPackageDir = resolve(distDir, 'falcon-ui')
const logsDir = resolve(rootDir, 'logs')

const entryPoints = {
  index: resolve(packagesDir, 'falcon-ui/index.ts'),
  'components/index': resolve(packagesDir, 'components/index.ts'),
  'components/button/index': resolve(packagesDir, 'components/button/index.ts'),
  'components/button/src/button': resolve(packagesDir, 'components/button/src/button.ts'),
  'components/button/src/button.vue': resolve(packagesDir, 'components/button/src/button.vue'),
  'components/dialog/index': resolve(packagesDir, 'components/dialog/index.ts'),
  'components/dialog/src/dialog': resolve(packagesDir, 'components/dialog/src/dialog.ts'),
  'components/dialog/src/dialog.vue': resolve(packagesDir, 'components/dialog/src/dialog.vue'),
  'components/input/index': resolve(packagesDir, 'components/input/index.ts'),
  'components/input/src/input': resolve(packagesDir, 'components/input/src/input.ts'),
  'components/input/src/input.vue': resolve(packagesDir, 'components/input/src/input.vue'),
  'components/input-search/index': resolve(packagesDir, 'components/input-search/index.ts'),
  'components/input-search/src/input-search': resolve(
    packagesDir,
    'components/input-search/src/input-search.ts'
  ),
  'components/input-search/src/input-search.vue': resolve(
    packagesDir,
    'components/input-search/src/input-search.vue'
  ),
  'components/input-number/index': resolve(packagesDir, 'components/input-number/index.ts'),
  'components/input-number/src/input-number': resolve(
    packagesDir,
    'components/input-number/src/input-number.ts'
  ),
  'components/input-number/src/input-number.vue': resolve(
    packagesDir,
    'components/input-number/src/input-number.vue'
  ),
  'components/date-picker/index': resolve(packagesDir, 'components/date-picker/index.ts'),
  'components/date-picker/src/date-picker': resolve(
    packagesDir,
    'components/date-picker/src/date-picker.ts'
  ),
  'components/date-picker/src/date-picker.vue': resolve(
    packagesDir,
    'components/date-picker/src/date-picker.vue'
  ),
  'components/qr-code/index': resolve(packagesDir, 'components/qr-code/index.ts'),
  'components/qr-code/src/qr-code': resolve(packagesDir, 'components/qr-code/src/qr-code.ts'),
  'components/qr-code/src/qr-code.vue': resolve(packagesDir, 'components/qr-code/src/qr-code.vue'),
  'components/barcode/index': resolve(packagesDir, 'components/barcode/index.ts'),
  'components/barcode/src/barcode': resolve(packagesDir, 'components/barcode/src/barcode.ts'),
  'components/barcode/src/barcode.vue': resolve(packagesDir, 'components/barcode/src/barcode.vue'),
  'components/select/index': resolve(packagesDir, 'components/select/index.ts'),
  'components/select/src/select': resolve(packagesDir, 'components/select/src/select.ts'),
  'components/select/src/select.vue': resolve(packagesDir, 'components/select/src/select.vue'),
  'components/table/index': resolve(packagesDir, 'components/table/index.ts'),
  'components/table/src/table': resolve(packagesDir, 'components/table/src/table.ts'),
  'components/table/src/table.vue': resolve(packagesDir, 'components/table/src/table.vue'),
  'components/radial-menu/index': resolve(packagesDir, 'components/radial-menu/index.ts'),
  'components/radial-menu/src/radial-menu': resolve(
    packagesDir,
    'components/radial-menu/src/radial-menu.ts'
  ),
  'components/radial-menu/src/radial-menu.vue': resolve(
    packagesDir,
    'components/radial-menu/src/radial-menu.vue'
  ),
  'utils/index': resolve(packagesDir, 'utils/index.ts'),
  'hooks/index': resolve(packagesDir, 'hooks/index.ts'),
  'icons/index': resolve(packagesDir, 'icons/index.ts')
}

const alias = {
  '@falcon-ui/falcon-ui': resolve(packagesDir, 'falcon-ui/index.ts'),
  '@falcon-ui/components': resolve(packagesDir, 'components/index.ts'),
  '@falcon-ui/hooks': resolve(packagesDir, 'hooks/index.ts'),
  '@falcon-ui/icons': resolve(packagesDir, 'icons/index.ts'),
  '@falcon-ui/utils': resolve(packagesDir, 'utils/index.ts')
}

const external = ['vue', 'element-plus', '@element-plus/icons-vue']

const umdGlobals = {
  vue: 'Vue',
  'element-plus': 'ElementPlus',
  '@element-plus/icons-vue': 'ElementPlusIconsVue'
}

export {
  alias,
  distDir,
  logsDir,
  distPackageDir,
  entryPoints,
  external,
  packagesDir,
  rootDir,
  umdGlobals
}
