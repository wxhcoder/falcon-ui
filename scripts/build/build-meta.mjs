import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { distPackageDir, rootDir } from './constants.mjs'
import { logInfo } from './logger.mjs'

const buildMeta = async () => {
  const sourcePackageFile = resolve(rootDir, 'packages/falcon-ui/package.json')
  const sourcePackageJson = JSON.parse(await readFile(sourcePackageFile, 'utf8'))

  const publishPackageJson = {
    name: 'falcon-ui',
    version: sourcePackageJson.version,
    type: 'module',
    main: './cjs/index.cjs',
    module: './esm/index.mjs',
    types: './types/falcon-ui/index.d.ts',
    files: ['esm', 'cjs', 'umd', 'types', 'theme', 'global.d.ts', 'package.json'],
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
      './components/input': {
        types: './types/components/input/index.d.ts',
        import: './esm/components/input/index.mjs',
        require: './cjs/components/input/index.cjs'
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
    peerDependencies: {
      vue: '^3.5.0',
      'element-plus': '^2.0.0'
    }
  }

  await mkdir(distPackageDir, { recursive: true })
  const targetPackageFile = resolve(distPackageDir, 'package.json')

  await logInfo(`publish package name=${publishPackageJson.name}`, { stage: 'meta' })
  await logInfo(`publish package version=${publishPackageJson.version}`, { stage: 'meta' })
  await logInfo(`exports count=${Object.keys(publishPackageJson.exports).length}`, { stage: 'meta' })
  await logInfo(`write package metadata -> ${targetPackageFile}`, { stage: 'meta' })

  await writeFile(
    targetPackageFile,
    `${JSON.stringify(publishPackageJson, null, 2)}\n`
  )
}

export { buildMeta }
