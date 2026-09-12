import { vi } from 'vitest'

export function setupCanvas() {
  const ctx = {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    globalAlpha: 1,
    fillStyle: ''
  }
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    ctx as unknown as CanvasRenderingContext2D
  )
  const frames = new Map<number, FrameRequestCallback>()
  let id = 0
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++id, callback)
    return id
  })
  vi.stubGlobal('cancelAnimationFrame', (key: number) => {
    frames.delete(key)
  })
  const media = new Map<string, { matches: boolean; listeners: Set<() => void> }>()
  vi.stubGlobal('matchMedia', (query: string) => {
    let state = media.get(query)
    if (!state) {
      state = { matches: false, listeners: new Set() }
      media.set(query, state)
    }
    return {
      get matches() {
        return state.matches
      },
      addEventListener: (_type: string, fn: () => void) => state.listeners.add(fn),
      removeEventListener: (_type: string, fn: () => void) => state.listeners.delete(fn)
    }
  })
  let intersection: IntersectionObserverCallback | undefined
  const disconnect = vi.fn()
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: IntersectionObserverCallback) {
        intersection = callback
      }
      observe() {}
      disconnect = disconnect
    }
  )
  return {
    ctx,
    frames,
    media,
    disconnect,
    step(time: number) {
      const callbacks = [...frames.values()]
      frames.clear()
      callbacks.forEach((callback) => callback(time))
    },
    intersect(visible: boolean) {
      intersection?.(
        [{ isIntersecting: visible } as IntersectionObserverEntry],
        {} as IntersectionObserver
      )
    },
    reduce(value: boolean) {
      const state = media.get('(prefers-reduced-motion: reduce)')!
      state.matches = value
      state.listeners.forEach((fn) => fn())
    }
  }
}
