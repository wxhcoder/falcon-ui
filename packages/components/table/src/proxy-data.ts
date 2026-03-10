import type { CellChangeEvent, RowData } from './table'

type ProxyRuntime = {
  onCellChange: (payload: CellChangeEvent) => void
  resolveRowIndex: (row: RowData) => number
  rowKeyField: string
  maxDepth: number
}

type BuildProxyDataOptions = {
  data: RowData[]
  onCellChange: (payload: CellChangeEvent) => void
  resolveRowIndex: (row: RowData) => number
  rowKeyField: string
  maxDepth: number
}

type PathAwareCache = WeakMap<object, Map<string, unknown>>

const isObjectLike = (value: unknown): value is Record<PropertyKey, unknown> =>
  value !== null && typeof value === 'object'

const composePath = (base: string, key: PropertyKey) => {
  const keyText = typeof key === 'symbol' ? '' : String(key)
  if (!keyText) {
    return base
  }

  return base ? `${base}.${keyText}` : keyText
}

const resolveRowKey = (row: RowData, rowIndex: number, rowKeyField: string): string | number => {
  const candidate = row[rowKeyField]
  if (typeof candidate === 'string' || typeof candidate === 'number') {
    return candidate
  }

  return rowIndex
}

const resolveColumnKey = (path: string): string => {
  if (!path) {
    return ''
  }

  const [first] = path.split('.')
  return first || path
}

export const createTableProxyDataBuilder = () => {
  const cache: PathAwareCache = new WeakMap()

  const runtime: ProxyRuntime = {
    onCellChange: () => undefined,
    resolveRowIndex: () => -1,
    rowKeyField: 'id',
    maxDepth: 4
  }

  const getCachedProxy = (target: object, path: string) => cache.get(target)?.get(path)

  const setCachedProxy = (target: object, path: string, proxy: unknown) => {
    if (!cache.has(target)) {
      cache.set(target, new Map())
    }

    cache.get(target)?.set(path, proxy)
  }

  const toNullableRow = (value: unknown): RowData | null => {
    if (!isObjectLike(value)) {
      return null
    }

    return value as RowData
  }

  const createProxy = (
    target: Record<PropertyKey, unknown>,
    rootRow: RowData,
    path: string,
    depth: number
  ): unknown => {
    const cached = getCachedProxy(target, path)
    if (cached) {
      return cached
    }

    const proxy = new Proxy(target, {
      get(currentTarget, key, receiver) {
        const value = Reflect.get(currentTarget, key, receiver)

        if (!isObjectLike(value)) {
          return value
        }

        if (depth >= runtime.maxDepth) {
          return value
        }

        const nextPath = composePath(path, key)
        return createProxy(value, rootRow, nextPath, depth + 1)
      },
      set(currentTarget, key, value, receiver) {
        const previousValue = Reflect.get(currentTarget, key, receiver)
        const result = Reflect.set(currentTarget, key, value, receiver)

        if (!result || typeof key === 'symbol' || Object.is(previousValue, value)) {
          return result
        }

        const nextPath = composePath(path, key)
        const rowIndex = runtime.resolveRowIndex(rootRow)

        runtime.onCellChange({
          rowIndex,
          rowKey: resolveRowKey(rootRow, rowIndex, runtime.rowKeyField),
          columnKey: resolveColumnKey(nextPath),
          path: nextPath,
          prevValue: previousValue,
          nextValue: value,
          trigger: 'proxy-set'
        })

        return result
      }
    })

    setCachedProxy(target, path, proxy)
    return proxy
  }

  return ({
    data,
    onCellChange,
    resolveRowIndex,
    rowKeyField,
    maxDepth
  }: BuildProxyDataOptions) => {
    runtime.onCellChange = onCellChange
    runtime.resolveRowIndex = resolveRowIndex
    runtime.rowKeyField = rowKeyField
    runtime.maxDepth = maxDepth

    return data.map((row) => {
      const rawRow = toNullableRow(row)
      if (!rawRow) {
        return row
      }

      return createProxy(rawRow, rawRow, '', 0) as RowData
    })
  }
}
