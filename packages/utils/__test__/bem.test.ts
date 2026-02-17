import { describe, expect, it } from 'vitest'
import { useNamespace } from '../src/bem'

describe('useNamespace', () => {
  it('creates block and element class names', () => {
    const ns = useNamespace('button')

    expect(ns.b()).toBe('fl-button')
    expect(ns.e('content')).toBe('fl-button__content')
    expect(ns.m('primary')).toBe('fl-button--primary')
  })

  it('creates state classes with is prefix', () => {
    const ns = useNamespace('button')

    expect(ns.is('disabled', true)).toBe('is-disabled')
    expect(ns.is('loading', false)).toBe('')
  })
})
