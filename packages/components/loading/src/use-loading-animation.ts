import { onActivated, onDeactivated, onMounted, onScopeDispose, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { normalizeAnimation, normalizeSize, normalizeSpeed } from './loading'
import type { FlLoadingAnimation, FlLoadingSize } from './loading'
import { createLoadingFrame, paintLoadingFrame } from './loading-renderer'

interface AnimationOptions {
  active: boolean
  paused: boolean
  animation: FlLoadingAnimation
  size: FlLoadingSize
  speed: number
}

export function useLoadingAnimation(
  canvas: Ref<HTMLCanvasElement | undefined>,
  options: () => AnimationOptions,
  color: Ref<string>
) {
  const available = ref(true)
  let ctx: CanvasRenderingContext2D | null = null
  let raf: number | undefined
  let previous: number | undefined
  let elapsed = 0
  let enabled = true
  let inView = true
  let reduced = false
  let mounted = false
  let dpr = 1
  let observer: IntersectionObserver | undefined
  let motion: MediaQueryList | undefined
  const stop = () => {
    if (raf !== undefined) cancelAnimationFrame(raf)
    raf = undefined
    previous = undefined
  }
  const running = () =>
    mounted &&
    ctx &&
    enabled &&
    inView &&
    options().active &&
    !options().paused &&
    !reduced &&
    document.visibilityState !== 'hidden'
  const paint = () => {
    if (!ctx || !canvas.value) return
    const size = normalizeSize(options().size)
    const ratio = Math.min(2, Math.max(1, window.devicePixelRatio || 1))
    if (canvas.value.width !== Math.round(size * ratio) || ratio !== dpr) {
      canvas.value.width = Math.round(size * ratio)
      canvas.value.height = Math.round(size * ratio)
    }
    dpr = ratio
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size, size)
    try {
      paintLoadingFrame(
        ctx,
        createLoadingFrame(normalizeAnimation(options().animation), size, reduced ? 0.6 : elapsed),
        color.value
      )
    } catch {
      available.value = false
      ctx = null
      stop()
    }
  }
  const tick = (now: number) => {
    raf = undefined
    if (!running()) {
      previous = undefined
      return
    }
    if (previous !== undefined)
      elapsed += (Math.min(100, now - previous) / 1000) * normalizeSpeed(options().speed)
    previous = now
    paint()
    if (running()) raf = requestAnimationFrame(tick)
  }
  const sync = () => {
    if (!mounted) return
    if (!running()) stop()
    if (options().active && inView && enabled && document.visibilityState !== 'hidden') paint()
    if (running() && raf === undefined) raf = requestAnimationFrame(tick)
  }
  const motionChange = () => {
    reduced = motion?.matches ?? false
    sync()
  }
  watch(
    () => [
      options().active,
      options().paused,
      options().animation,
      options().size,
      options().speed,
      color.value
    ],
    sync,
    { flush: 'post' }
  )
  onMounted(() => {
    mounted = true
    try {
      ctx = canvas.value?.getContext('2d') ?? null
    } catch {
      ctx = null
    }
    available.value = !!ctx
    motion = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    reduced = motion?.matches ?? false
    motion?.addEventListener('change', motionChange)
    if (typeof IntersectionObserver !== 'undefined' && canvas.value) {
      observer = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting
        sync()
      })
      observer.observe(canvas.value)
    }
    document.addEventListener('visibilitychange', sync)
    window.addEventListener('resize', sync)
    sync()
  })
  onActivated(() => {
    enabled = true
    sync()
  })
  onDeactivated(() => {
    enabled = false
    stop()
  })
  onScopeDispose(() => {
    mounted = false
    stop()
    observer?.disconnect()
    motion?.removeEventListener('change', motionChange)
    if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', sync)
    if (typeof window !== 'undefined') window.removeEventListener('resize', sync)
    ctx = null
  })
  return { available }
}
