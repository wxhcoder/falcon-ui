<template>
  <main class="falcon-homepage">
    <div
      class="falcon-homepage__noise"
      aria-hidden="true"
      :style="{ '--home-noise-mask': `url('${withBase('/home-noise.svg')}')` }" />

    <section class="falcon-homepage__hero" aria-labelledby="falcon-homepage-title">
      <div class="falcon-homepage__copy">
        <p class="falcon-homepage__eyebrow">{{ content.eyebrow }}</p>
        <h1 id="falcon-homepage-title">
          {{ content.titleStart }}
          <span>{{ content.titleAccent }}</span>
        </h1>
        <p class="falcon-homepage__description">{{ content.description }}</p>

        <div class="falcon-homepage__actions">
          <a
            class="falcon-homepage__action falcon-homepage__action--primary"
            :href="withBase(content.primaryAction.link)">
            {{ content.primaryAction.label }}
            <span aria-hidden="true">→</span>
          </a>
          <a
            class="falcon-homepage__action falcon-homepage__action--secondary"
            :href="withBase(content.secondaryAction.link)">
            {{ content.secondaryAction.label }}
          </a>
        </div>
      </div>

      <HomeExplodedIllustration :label="content.illustrationLabel" />
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import HomeExplodedIllustration from './HomeExplodedIllustration.vue'

interface HomeAction {
  label: string
  link: string
}

interface HomeContent {
  eyebrow: string
  titleStart: string
  titleAccent: string
  description: string
  illustrationLabel: string
  primaryAction: HomeAction
  secondaryAction: HomeAction
}

const { localeIndex } = useData()
const isEnglish = computed(() => localeIndex.value === 'en')

const content = computed<HomeContent>(() =>
  isEnglish.value
    ? {
        eyebrow: 'Falcon UI / System layers',
        titleStart: 'Build interfaces with a',
        titleAccent: 'clearer system.',
        description:
          'A focused component layer on top of Element Plus, built to keep real product interfaces consistent, composable, and quick to ship.',
        illustrationLabel:
          'An exploded four-plane UI system illustration showing foundation, content, layout, and template layers connected by blue anchors',
        primaryAction: { label: 'Get started', link: '/en/guide/getting-started' },
        secondaryAction: { label: 'Browse components', link: '/en/components/index' }
      }
    : {
        eyebrow: 'Falcon UI / 系统分层',
        titleStart: '让界面构建，',
        titleAccent: '更清晰有序。',
        description:
          '基于 Element Plus 的业务组件层，为真实产品界面提供一致、可组合且可快速交付的构建方式。',
        illustrationLabel: '通过蓝色锚点连接的四层 UI 系统爆炸图，展示基础、内容、布局和模板层级',
        primaryAction: { label: '开始使用', link: '/guide/getting-started' },
        secondaryAction: { label: '浏览组件', link: '/components/index' }
      }
)
</script>

<style scoped>
.falcon-homepage {
  --home-surface: #fff;
  --home-surface-soft: #f7faff;
  --home-text: #17213a;
  --home-text-muted: #65718a;
  --home-line: #dfe7f5;
  --home-blue: #165dff;
  --home-blue-hover: #0c4ce5;
  position: relative;
  isolation: isolate;
  display: grid;
  width: 100%;
  height: calc(100svh - var(--vp-nav-height, 64px));
  margin: 0 auto;
  padding: 0;
  overflow: hidden;
  color: var(--home-text);
  font-family: 'Avenir Next', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  align-items: center;
}

.falcon-homepage__noise {
  --home-noise-rest: color-mix(in srgb, var(--vp-c-text-1) 12%, var(--vp-c-bg));
  --home-noise-crest: color-mix(in srgb, var(--vp-c-text-1) 22%, var(--vp-c-bg));
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image: linear-gradient(
    115deg,
    var(--home-noise-rest) 0%,
    var(--home-noise-rest) 34%,
    var(--home-noise-crest) 48%,
    var(--home-noise-rest) 62%,
    var(--home-noise-rest) 100%
  );
  background-repeat: no-repeat;
  background-position: 100% 50%;
  background-size: 220% 100%;
  -webkit-mask-image: var(--home-noise-mask);
  mask-image: var(--home-noise-mask);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-size: cover;
  mask-size: cover;
  animation: home-noise-wave 12s ease-in-out infinite alternate;
  pointer-events: none;
  will-change: background-position;
}

@keyframes home-noise-wave {
  0%,
  100% {
    background-position: 100% 50%;
  }

  50% {
    background-position: 0% 50%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .falcon-homepage__noise {
    animation: none;
    background-position: 50% 50%;
  }
}

.falcon-homepage__hero {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(360px, 0.36fr) minmax(0, 0.64fr);
  align-items: center;
  width: min(100%, 1320px);
  min-height: 0;
  margin: 0 auto;
  gap: clamp(20px, 3vw, 44px);
  padding: clamp(16px, 2vw, 28px) clamp(8px, 2vw, 24px);
}

.falcon-homepage__copy {
  position: relative;
  z-index: 1;
}

.falcon-homepage__eyebrow {
  margin: 0 0 18px;
  color: var(--home-blue);
  font-size: 12px;
  font-weight: 750;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.falcon-homepage h1,
.falcon-homepage h2,
.falcon-homepage p {
  margin: 0;
}

.falcon-homepage h1 {
  max-width: 520px;
  color: var(--home-text);
  font-size: clamp(45px, 4.5vw, 72px);
  font-weight: 760;
  letter-spacing: -0.065em;
  line-height: 0.98;
}

.falcon-homepage h1 span {
  display: block;
  color: var(--home-blue);
}

.falcon-homepage__description {
  max-width: 485px;
  margin-top: 25px !important;
  color: var(--home-text-muted);
  font-size: 16px;
  line-height: 1.75;
}

.falcon-homepage__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 31px;
}

.falcon-homepage__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.falcon-homepage__action {
  min-height: 46px;
  padding: 0 18px;
}

.falcon-homepage__action--primary {
  background: var(--home-blue);
  color: #fff;
  box-shadow: 0 11px 22px rgb(22 93 255 / 23%);
}

.falcon-homepage__action--primary:hover {
  background: var(--home-blue-hover);
  color: #fff;
  transform: translateY(-2px);
}

.falcon-homepage__action--secondary {
  border: 1px solid var(--home-line);
  background: var(--home-surface);
  color: var(--home-text);
}

.falcon-homepage__action--secondary:hover {
  border-color: color-mix(in srgb, var(--home-blue) 48%, var(--home-line));
  color: var(--home-blue);
  transform: translateY(-2px);
}

.falcon-homepage__action:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--home-blue) 38%, transparent);
  outline-offset: 3px;
}

:global(.dark) .falcon-homepage {
  --home-surface: #1a2233;
  --home-surface-soft: #161f30;
  --home-text: #edf3ff;
  --home-text-muted: #a8b5cd;
  --home-line: #303d55;
  --home-blue: #69a0ff;
  --home-blue-hover: #8bb5ff;
}

:global(.dark) .falcon-homepage__action--primary {
  color: #102043;
  box-shadow: 0 12px 26px rgb(0 0 0 / 24%);
}

:global(.page-content:has(.falcon-homepage)) {
  padding-top: 0;
  overflow: hidden;
}

:global(.doc-content-wrapper:has(.falcon-homepage)) {
  padding: 0;
}

:global(.doc-content-container:has(.falcon-homepage)),
:global(.doc-content:has(.falcon-homepage)) {
  width: 100%;
}

@media (max-width: 960px) {
  .falcon-homepage__hero {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .falcon-homepage__copy {
    max-width: 620px;
    margin-inline: auto;
    text-align: center;
  }

  .falcon-homepage__description {
    margin-inline: auto;
  }

  .falcon-homepage__actions {
    justify-content: center;
  }
}

@media (max-width: 767px) {
  .falcon-homepage__hero {
    padding: 12px 0;
  }

  .falcon-homepage h1 {
    font-size: clamp(34px, 10vw, 46px);
  }

  .falcon-homepage__description {
    margin-top: 18px !important;
    font-size: 14px;
    line-height: 1.58;
  }

  .falcon-homepage__actions {
    margin-top: 22px;
  }
}
</style>
