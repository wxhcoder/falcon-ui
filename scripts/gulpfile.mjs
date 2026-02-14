import gulp from 'gulp'
import { buildJs } from './build/build-js.mjs'
import { cleanDist } from './build/clean.mjs'
import { buildMeta } from './build/build-meta.mjs'
import { buildStyle } from './build/build-style.mjs'
import { buildTypes } from './build/build-types.mjs'
import { flushBuildLogs, initBuildLogger, logSummary, withStage } from './build/logger.mjs'

const { parallel, series } = gulp

const bootstrap = async () => {
  await initBuildLogger()
}

const clean = async () => withStage('clean', cleanDist)
const js = async () => withStage('js', buildJs)
const types = async () => withStage('types', buildTypes)
const style = async () => withStage('style', buildStyle)
const meta = async () => withStage('meta', buildMeta)

const finalize = async () => {
  await logSummary()
  await flushBuildLogs()
}

export { clean, js, meta, style, types }

export const build = series(bootstrap, clean, parallel(js, types, style), meta, finalize)

export default build
