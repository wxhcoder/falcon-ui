import { describe, expect, it, vi } from 'vitest'
import { invokeListener, mergeComponentExpose } from '../src/component'

describe('component helpers', () => {
  it('invokes function and array listeners', () => {
    const fn1 = vi.fn()
    const fn2 = vi.fn()

    invokeListener(fn1, 'a')
    invokeListener([fn1, fn2], 'b')

    expect(fn1).toHaveBeenNthCalledWith(1, 'a')
    expect(fn1).toHaveBeenNthCalledWith(2, 'b')
    expect(fn2).toHaveBeenCalledWith('b')
  })

  it('merges exposed fields with extras', () => {
    const vm = {
      exposed: {
        origin: true
      }
    }
    const exposed = {
      focus: vi.fn()
    }

    mergeComponentExpose(vm, exposed, { debugKind: 'input' })

    expect(vm.exposed?.origin).toBe(true)
    expect(vm.exposed?.debugKind).toBe('input')
    expect(typeof vm.exposed?.focus).toBe('function')
  })
})
