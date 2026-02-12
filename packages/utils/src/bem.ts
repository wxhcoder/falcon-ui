const defaultNamespace = 'f'
const statePrefix = 'is-'

const buildBemName = (
  namespace: string,
  block: string,
  blockSuffix = '',
  element = '',
  modifier = ''
) => {
  let className = `${namespace}-${block}`

  if (blockSuffix) {
    className += `-${blockSuffix}`
  }

  if (element) {
    className += `__${element}`
  }

  if (modifier) {
    className += `--${modifier}`
  }

  return className
}

export const useNamespace = (block: string, namespace = defaultNamespace) => {
  const b = (blockSuffix = '') => buildBemName(namespace, block, blockSuffix)

  const e = (element?: string) => (element ? buildBemName(namespace, block, '', element) : '')

  const m = (modifier?: string) =>
    modifier ? buildBemName(namespace, block, '', '', modifier) : ''

  const be = (blockSuffix?: string, element?: string) => {
    if (!blockSuffix || !element) {
      return ''
    }

    return buildBemName(namespace, block, blockSuffix, element)
  }

  const em = (element?: string, modifier?: string) => {
    if (!element || !modifier) {
      return ''
    }

    return buildBemName(namespace, block, '', element, modifier)
  }

  const bm = (blockSuffix?: string, modifier?: string) => {
    if (!blockSuffix || !modifier) {
      return ''
    }

    return buildBemName(namespace, block, blockSuffix, '', modifier)
  }

  const bem = (blockSuffix?: string, element?: string, modifier?: string) => {
    if (!blockSuffix && !element && !modifier) {
      return b()
    }

    return buildBemName(namespace, block, blockSuffix, element, modifier)
  }

  const is = (name: string, state = true) => (state ? `${statePrefix}${name}` : '')

  return {
    namespace,
    b,
    e,
    m,
    be,
    em,
    bm,
    bem,
    is
  }
}
