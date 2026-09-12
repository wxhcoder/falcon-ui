import { onMounted, onScopeDispose, ref, watch } from 'vue'
import type { FlLoadingTheme } from './loading'

/** Resolve variables at the source element before a loading mask moves into body. */
export function useLoadingColor(
  host: () => HTMLElement | undefined | null,
  options: () => { color?: string; theme?: FlLoadingTheme }
) {
  const color = ref('#20252b')
  let mounted = false
  let observer: MutationObserver | undefined
  let media: MediaQueryList | undefined
  let probe: HTMLSpanElement | undefined
  let observedHost: HTMLElement | undefined | null

  const resolve = () => {
    if (!mounted) return
    const target = host() || document.documentElement
    if (target !== observedHost) {
      observer?.disconnect()
      probe?.remove()
      probe = document.createElement('span')
      probe.setAttribute('aria-hidden', 'true')
      probe.style.cssText =
        'position:absolute;visibility:hidden;pointer-events:none;width:0;height:0;overflow:hidden'
      target.appendChild(probe)
      for (let el: HTMLElement | null = target; el; el = el.parentElement) {
        observer?.observe(el, {
          attributes: true,
          attributeFilter: ['class', 'style', 'data-theme']
        })
      }
      observedHost = target
    }
    const { color: explicit, theme = 'auto' } = options()
    let dark = theme === 'dark'
    if (theme === 'auto') {
      dark = media?.matches ?? false
      for (let el: HTMLElement | null = target; el; el = el.parentElement) {
        const marker = el.dataset.theme
        if (marker === 'dark' || marker === 'light') {
          dark = marker === 'dark'
          break
        }
        if (el.classList.contains('dark') || el.classList.contains('light')) {
          dark = el.classList.contains('dark')
          break
        }
      }
    }
    const variable = getComputedStyle(target).getPropertyValue('--fl-loading-color').trim()
    const fallback = dark ? '#f0f3f7' : '#20252b'
    if (probe) {
      probe.style.color = fallback
      if (explicit || variable) probe.style.color = explicit || variable
      color.value = getComputedStyle(probe).color || fallback
    }
  }
  watch([host, () => options().color, () => options().theme], resolve, { flush: 'post' })
  onMounted(() => {
    mounted = true
    media = window.matchMedia?.('(prefers-color-scheme: dark)')
    observer = typeof MutationObserver === 'undefined' ? undefined : new MutationObserver(resolve)
    media?.addEventListener('change', resolve)
    resolve()
  })
  onScopeDispose(() => {
    mounted = false
    observer?.disconnect()
    media?.removeEventListener('change', resolve)
    probe?.remove()
  })
  return color
}
