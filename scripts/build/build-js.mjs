import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { build } from 'rolldown-vite'
import { alias, distPackageDir, entryPoints, external, umdGlobals } from './constants.mjs'
import { logInfo, withEntry } from './logger.mjs'

const runEntryBuild = async (entryName, entryFile, format, outDirName, fileExt) => {
  const segments = entryName.split('/')
  const outFileName = `${segments[segments.length - 1]}.${fileExt}`
  const nestedDir = segments.length > 1 ? segments.slice(0, -1).join('/') : ''
  const outDir = nestedDir
    ? resolve(distPackageDir, outDirName, nestedDir)
    : resolve(distPackageDir, outDirName)
  const entryLabel = `${outDirName}:${entryName}`

  await withEntry('js', entryLabel, async () => {
    await logInfo(`source=${entryFile}`, { stage: 'js', entry: entryLabel })
    await logInfo(`outDir=${outDir} file=${outFileName}`, { stage: 'js', entry: entryLabel })

    await build({
      configFile: false,
      plugins: [vue()],
      resolve: {
        alias
      },
      build: {
        copyPublicDir: false,
        emptyOutDir: false,
        lib: {
          entry: entryFile,
          fileName: () => outFileName,
          formats: [format]
        },
        minify: false,
        outDir,
        rolldownOptions: {
          external,
          output: {
            exports: 'named'
          }
        },
        sourcemap: true
      }
    })
  })
}

const runModuleBuild = async (format, outDirName, fileExt) => {
  await logInfo(`start module format=${format}`, { stage: 'js' })

  for (const [entryName, entryFile] of Object.entries(entryPoints)) {
    await runEntryBuild(entryName, entryFile, format, outDirName, fileExt)
  }

  await logInfo(`finish module format=${format}`, { stage: 'js' })
}

const runUmdBuild = async () => {
  const entryLabel = 'umd:index'
  const umdOutDir = resolve(distPackageDir, 'umd')

  await withEntry('js', entryLabel, async () => {
    await logInfo(`source=${entryPoints.index}`, { stage: 'js', entry: entryLabel })
    await logInfo(`outDir=${umdOutDir} file=falcon-ui.umd.js`, { stage: 'js', entry: entryLabel })

    await build({
      configFile: false,
      plugins: [vue()],
      resolve: {
        alias
      },
      build: {
        copyPublicDir: false,
        emptyOutDir: false,
        lib: {
          entry: entryPoints.index,
          fileName: () => 'falcon-ui.umd.js',
          formats: ['umd'],
          name: 'FalconUI'
        },
        minify: false,
        outDir: umdOutDir,
        rolldownOptions: {
          external,
          output: {
            exports: 'named',
            globals: umdGlobals
          }
        },
        sourcemap: true
      }
    })
  })
}

const buildJs = async () => {
  await logInfo(`entry count=${Object.keys(entryPoints).length}`, { stage: 'js' })
  await logInfo(`externals=${external.join(', ')}`, { stage: 'js' })
  await runModuleBuild('es', 'esm', 'mjs')
  await runModuleBuild('cjs', 'cjs', 'cjs')
  await runUmdBuild()
}

export { buildJs }
