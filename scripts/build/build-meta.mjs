import { cp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { distPackageDir, rootDir } from './constants.mjs'
import { logInfo } from './logger.mjs'

const buildMeta = async () => {
  const sourcePackageFile = resolve(rootDir, 'packages/falcon-ui/package.json')
  const sourcePackageJson = JSON.parse(await readFile(sourcePackageFile, 'utf8'))

  const publishPackageJson = {
    name: sourcePackageJson.name,
    version: sourcePackageJson.version,
    description: sourcePackageJson.description,
    license: sourcePackageJson.license,
    repository: sourcePackageJson.repository,
    type: 'module',
    main: './cjs/index.cjs',
    module: './esm/index.mjs',
    types: './types/falcon-ui/index.d.ts',
    files: [
      'esm',
      'cjs',
      'umd',
      'types',
      'theme',
      'global.d.ts',
      'README.md',
      'LICENSE',
      'package.json'
    ],
    exports: {
      '.': {
        types: './types/falcon-ui/index.d.ts',
        import: './esm/index.mjs',
        require: './cjs/index.cjs'
      },
      './global': './global.d.ts',
      './components': {
        types: './types/components/index.d.ts',
        import: './esm/components/index.mjs',
        require: './cjs/components/index.cjs'
      },
      './components/button': {
        types: './types/components/button/index.d.ts',
        import: './esm/components/button/index.mjs',
        require: './cjs/components/button/index.cjs'
      },
      './components/dialog': {
        types: './types/components/dialog/index.d.ts',
        import: './esm/components/dialog/index.mjs',
        require: './cjs/components/dialog/index.cjs'
      },
      './components/input': {
        types: './types/components/input/index.d.ts',
        import: './esm/components/input/index.mjs',
        require: './cjs/components/input/index.cjs'
      },
      './components/input-search': {
        types: './types/components/input-search/index.d.ts',
        import: './esm/components/input-search/index.mjs',
        require: './cjs/components/input-search/index.cjs'
      },
      './components/input-number': {
        types: './types/components/input-number/index.d.ts',
        import: './esm/components/input-number/index.mjs',
        require: './cjs/components/input-number/index.cjs'
      },
      './components/date-picker': {
        types: './types/components/date-picker/index.d.ts',
        import: './esm/components/date-picker/index.mjs',
        require: './cjs/components/date-picker/index.cjs'
      },
      './components/qr-code': {
        types: './types/components/qr-code/index.d.ts',
        import: './esm/components/qr-code/index.mjs',
        require: './cjs/components/qr-code/index.cjs'
      },
      './components/barcode': {
        types: './types/components/barcode/index.d.ts',
        import: './esm/components/barcode/index.mjs',
        require: './cjs/components/barcode/index.cjs'
      },
      './components/select': {
        types: './types/components/select/index.d.ts',
        import: './esm/components/select/index.mjs',
        require: './cjs/components/select/index.cjs'
      },
      './components/tree-select': {
        types: './types/components/tree-select/index.d.ts',
        import: './esm/components/tree-select/index.mjs',
        require: './cjs/components/tree-select/index.cjs'
      },
      './components/tree': {
        types: './types/components/tree/index.d.ts',
        import: './esm/components/tree/index.mjs',
        require: './cjs/components/tree/index.cjs'
      },
      './components/table': {
        types: './types/components/table/index.d.ts',
        import: './esm/components/table/index.mjs',
        require: './cjs/components/table/index.cjs'
      },
      './components/radial-menu': {
        types: './types/components/radial-menu/index.d.ts',
        import: './esm/components/radial-menu/index.mjs',
        require: './cjs/components/radial-menu/index.cjs'
      },
      './utils': {
        types: './types/utils/index.d.ts',
        import: './esm/utils/index.mjs',
        require: './cjs/utils/index.cjs'
      },
      './hooks': {
        types: './types/hooks/index.d.ts',
        import: './esm/hooks/index.mjs',
        require: './cjs/hooks/index.cjs'
      },
      './icons': {
        types: './types/icons/index.d.ts',
        import: './esm/icons/index.mjs',
        require: './cjs/icons/index.cjs'
      },
      './theme/index.css': './theme/index.css',
      './theme/index.scss': './theme/index.scss'
    },
    sideEffects: ['**/*.css'],
    publishConfig: {
      access: 'public'
    },
    peerDependencies: {
      vue: '^3.5.0',
      'element-plus': '^2.0.0',
      '@element-plus/icons-vue': '^2.0.0'
    }
  }

  await mkdir(distPackageDir, { recursive: true })
  const targetPackageFile = resolve(distPackageDir, 'package.json')

  await logInfo(`publish package name=${publishPackageJson.name}`, { stage: 'meta' })
  await logInfo(`publish package version=${publishPackageJson.version}`, { stage: 'meta' })
  await logInfo(`exports count=${Object.keys(publishPackageJson.exports).length}`, {
    stage: 'meta'
  })
  await logInfo(`write package metadata -> ${targetPackageFile}`, { stage: 'meta' })

  await writeFile(targetPackageFile, `${JSON.stringify(publishPackageJson, null, 2)}\n`)
  await cp(resolve(rootDir, 'README.md'), resolve(distPackageDir, 'README.md'))
  await cp(resolve(rootDir, 'LICENSE'), resolve(distPackageDir, 'LICENSE'))
}

export { buildMeta }
