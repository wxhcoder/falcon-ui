import { cp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import postcss from 'postcss'
import * as sass from 'sass'
import { distPackageDir, rootDir } from './constants.mjs'
import { logInfo } from './logger.mjs'

const buildStyle = async () => {
  const rootPackageFile = resolve(rootDir, 'package.json')
  const sourceFile = resolve(rootDir, 'packages/theme/index.scss')
  const sourceThemeRoot = resolve(rootDir, 'packages/theme')
  const sourceThemeSrc = resolve(sourceThemeRoot, 'src')
  const distThemeDir = resolve(distPackageDir, 'theme')
  const distThemeSrc = resolve(distThemeDir, 'src')
  const distCssFile = resolve(distThemeDir, 'index.css')
  const distScssEntryFile = resolve(distThemeDir, 'index.scss')
  const rootPackageJson = JSON.parse(await readFile(rootPackageFile, 'utf8'))
  const browserslist = rootPackageJson.browserslist

  await logInfo(`compile scss: ${sourceFile}`, { stage: 'style' })
  await logInfo(`browserslist=${JSON.stringify(browserslist)}`, { stage: 'style' })
  const sassResult = sass.compile(sourceFile, {
    style: 'expanded'
  })

  const inputBytes = Buffer.byteLength(sassResult.css, 'utf8')
  await logInfo(`sass output size=${inputBytes} bytes`, { stage: 'style' })
  await logInfo(`postcss plugins=autoprefixer, cssnano`, { stage: 'style' })

  const postcssResult = await postcss([
    autoprefixer(),
    cssnano({
      preset: 'default'
    })
  ]).process(sassResult.css, {
    from: sourceFile,
    to: distCssFile
  })

  const outputBytes = Buffer.byteLength(postcssResult.css, 'utf8')
  await logInfo(`postcss output size=${outputBytes} bytes`, { stage: 'style' })

  await mkdir(distThemeDir, { recursive: true })
  await logInfo(`write css: ${distCssFile}`, { stage: 'style' })
  await writeFile(distCssFile, postcssResult.css)

  await logInfo(`copy scss entry: ${sourceFile} -> ${distScssEntryFile}`, { stage: 'style' })
  await cp(sourceFile, distScssEntryFile)
  await mkdir(distThemeSrc, { recursive: true })
  await logInfo(`copy scss src: ${sourceThemeSrc} -> ${distThemeSrc}`, { stage: 'style' })
  await cp(sourceThemeSrc, distThemeSrc, { recursive: true })
}

export { buildStyle }
