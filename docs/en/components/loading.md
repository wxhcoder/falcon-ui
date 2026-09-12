---
pageClass: loading-docs-page
---

# Loading

Seven dot animations, usable independently or inside the original Element Plus `v-loading` mask.
Earth dots follow real land outlines. All geographic data ships locally with the component.

## Animations

::: demo loading/gallery
:::

## Sizes

::: demo loading/size
:::

## Live controls

Change animation, size, speed and color, or freeze the current frame. `active=false` hides the
indicator while preserving its space. Use `v-if` to remove it. Reduced motion displays a static frame.

::: demo loading/controls
:::

## Native v-loading

::: demo loading/overlay
:::

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { vLoading } from 'element-plus'
import { useFlLoading } from '@falcon-ui/falcon-ui'
import '@falcon-ui/falcon-ui/theme/index.css'

const pending = ref(false)
const loading = useFlLoading(pending, () => ({
  animation: 'earth',
  text: 'Searching…',
  background: 'transparent'
}))
</script>

<template>
  <section v-loading="loading" :aria-busy="pending">Content</section>
</template>
```

Call `useFlLoading` in setup. Both arguments accept values, refs or getters. The result is an options
object while active and `false` otherwise. Do not replace the false value with `{ visible: false }`.
The native body and fullscreen.lock modifiers retain their behavior. Fullscreen masks are singletons;
aggregate concurrent requests into one pending state.

Options accept all visual props except active, plus `background`, `customClass` and `themeTarget`.
Masks default to vertical layout; standalone indicators default to inline. `themeTarget` accepts an
element, ref or getter to preserve the source region's color when a mask moves into body. It defaults
to the document root. Do not combine helper options with native spinner/svg/text attributes.

## Imports and styles

```ts
import { FlLoading, useFlLoading } from '@falcon-ui/falcon-ui/components/loading'
import '@falcon-ui/falcon-ui/theme/index.css'
```

Standalone FlLoading needs no directive registration. The helper does not replace the original
directive or style other masks. Workspace source imports can use `@falcon-ui/components/loading`.
The compatibility baseline is Element Plus 2.13.6; retest mask structure and layout after upgrades.
Applications using a custom namespace must supply the matching Element Plus theme.

## API

### Props

<VpApiTable source="/api-meta/fl-loading.json" section="props" />

### Slots

<VpApiTable source="/api-meta/fl-loading.json" section="slots" />

The text slot replaces visible text and must use phrasing content such as span elements.
There are no emitted events or imperative methods. Set ariaLabel to a localized loading message
when no text is visible; the component default is Chinese.

### Color and lifecycle

Dot color resolves from color, then `--fl-loading-color`, then theme. Auto detects the nearest
data-theme or dark/light class, falling back to the system theme. Paused, hidden, offscreen,
background and deactivated indicators stop drawing. Unmounting removes callbacks and listeners.
If Canvas is unavailable, the component shows a static dot and status text.

Original algorithms: [Thinking Orbs](https://github.com/Jakubantalik/thinking-orbs).
Land outlines: [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/).
