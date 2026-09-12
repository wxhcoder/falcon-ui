import { computed, defineComponent, h, onScopeDispose, ref, toValue, watch } from 'vue'
import type { ComputedRef, MaybeRefOrGetter, VNode } from 'vue'
import type { LoadingOptions } from 'element-plus'
import { useNamespace } from '@falcon-ui/utils'
import FlLoading from './FlLoading.vue'
import type { FlLoadingProps } from './loading'
import { useLoadingColor } from './use-loading-color'

export interface FlLoadingOptions extends Omit<FlLoadingProps, 'active'> {
  background?: string
  customClass?: string
  themeTarget?: MaybeRefOrGetter<HTMLElement | null | undefined>
}

/** Plain values are also accepted by the native directive's narrower binding type. */
export interface FlLoadingDirectiveOptions {
  text: VNode
  customClass: string
  background?: string
}

/** Create options for the ORIGINAL Element Plus directive; install vLoading separately. */
export function useFlLoading(
  active: MaybeRefOrGetter<boolean>,
  options: MaybeRefOrGetter<FlLoadingOptions> = {}
): ComputedRef<false | FlLoadingDirectiveOptions> {
  const ns = useNamespace('loading')
  const alive = ref(true)
  const generation = ref(0)
  const resolved = computed(() => toValue(options))
  const color = useLoadingColor(
    () => toValue(resolved.value.themeTarget),
    () => resolved.value
  )
  watch(
    () => toValue(active),
    () => generation.value++,
    { flush: 'sync' }
  )
  onScopeDispose(() => {
    alive.value = false
  })
  // A closing instance must stay stopped even when a new request opens before its transition ends.
  const Content = defineComponent({
    name: 'FlLoadingContent',
    props: { generation: { type: Number, required: true } },
    setup(props) {
      const ownGeneration = props.generation
      return () => {
        const {
          background: _background,
          customClass: _customClass,
          themeTarget: _target,
          ...visual
        } = resolved.value
        return h(FlLoading, {
          layout: 'vertical',
          ...visual,
          color: color.value,
          active: alive.value && toValue(active) && ownGeneration === generation.value
        })
      }
    }
  })
  return computed(() => {
    if (!alive.value || !toValue(active)) return false
    return {
      text: h(Content, { generation: generation.value }),
      customClass: [ns.b('adapter'), resolved.value.customClass].filter(Boolean).join(' '),
      background: resolved.value.background
    } satisfies LoadingOptions
  })
}
