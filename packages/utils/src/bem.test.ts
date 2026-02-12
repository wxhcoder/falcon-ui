import { describe, expect, it } from 'vitest'
import { useNamespace } from './bem'

describe('useNamespace', () => {
  it('creates block and element class names', () => {
    const ns = useNamespace('button')

    expect(ns.b()).toBe('f-button')
    expect(ns.e('content')).toBe('f-button__content')
    expect(ns.m('primary')).toBe('f-button--primary')
  })

  it('creates state classes with is prefix', () => {
    const ns = useNamespace('button')

    expect(ns.is('disabled', true)).toBe('is-disabled')
    expect(ns.is('loading', false)).toBe('')
  })
})
