<template>
  <div class="home-exploded-illustration" role="img" :aria-label="label">
    <span class="home-exploded-illustration__glow" aria-hidden="true" />

    <div class="home-exploded-illustration__connectors" aria-hidden="true">
      <span class="home-exploded-illustration__connector connector--left">
        <span class="home-exploded-illustration__anchor anchor--template" />
        <span class="home-exploded-illustration__anchor anchor--layout" />
        <span class="home-exploded-illustration__anchor anchor--foundation" />
        <span class="home-exploded-illustration__anchor anchor--base" />
      </span>
      <span class="home-exploded-illustration__connector connector--right">
        <span class="home-exploded-illustration__anchor anchor--template" />
        <span class="home-exploded-illustration__anchor anchor--layout" />
        <span class="home-exploded-illustration__anchor anchor--foundation" />
        <span class="home-exploded-illustration__anchor anchor--base" />
      </span>
    </div>

    <div class="home-exploded-illustration__stage" aria-hidden="true">
      <section
        class="home-exploded-illustration__layer layer--template"
        aria-label="Template layer">
        <div class="browser-bar">
          <span class="browser-bar__mark" />
          <span class="browser-bar__track" />
          <span class="browser-bar__dot" />
        </div>
        <div class="template-layout">
          <div class="template-layout__nav">
            <span class="is-active" />
            <span />
            <span />
            <span />
          </div>
          <div class="template-layout__content">
            <p>Template</p>
            <strong>Getting started</strong>
            <span class="copy-line" />
            <span class="copy-line is-short" />
            <div class="template-layout__actions">
              <i>Preview</i>
              <i>Code</i>
            </div>
          </div>
        </div>
      </section>

      <section class="home-exploded-illustration__layer layer--layout" aria-label="Layout layer">
        <article class="ui-card ui-card--navigation">
          <p>Navigation</p>
          <strong>Primary</strong>
          <span />
          <span class="is-short" />
        </article>
        <article class="ui-card ui-card--dialog">
          <p>Dialog</p>
          <b>Build title</b>
          <span />
          <span class="is-short" />
          <small>Cancel <em>Confirm</em></small>
        </article>
        <article class="ui-card ui-card--table">
          <p>Table</p>
          <span class="table-row is-header" />
          <span class="table-row" />
          <span class="table-row" />
          <span class="table-row" />
        </article>
      </section>

      <section
        class="home-exploded-illustration__layer layer--foundation"
        aria-label="Foundation layer">
        <article class="token-card token-card--foundation">
          <p>Foundation</p>
          <div class="token-card__shapes"><i /><i /><i /></div>
          <small><b>Aa</b><b>R8</b></small>
        </article>
        <article class="token-card token-card--theme">
          <p>Theme</p>
          <div class="token-card__swatches"><i /><i /><i /></div>
        </article>
        <article class="token-card token-card--form">
          <p>Form controls</p>
          <div class="token-card__controls"><i>✓</i><i /></div>
          <span />
        </article>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
  }>(),
  {
    label: 'A three-layer UI system illustration showing foundation, layout, and template layers'
  }
)
</script>

<style scoped>
.home-exploded-illustration {
  --illustration-blue: #165dff;
  --illustration-blue-soft: #e1eaff;
  --illustration-ink: #1a243d;
  --illustration-muted: #8896b1;
  --illustration-line: #dfe7f5;
  --illustration-panel: rgb(255 255 255 / 92%);
  --illustration-card: rgb(251 253 255 / 87%);
  --illustration-shadow: 0 30px 58px rgb(53 82 129 / 13%);
  position: relative;
  isolation: isolate;
  width: min(100%, 610px);
  min-height: 540px;
  margin-inline: auto;
  font-family: 'Avenir Next', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.home-exploded-illustration__glow {
  position: absolute;
  top: 9%;
  left: 13%;
  z-index: -1;
  width: 72%;
  height: 78%;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(22 93 255 / 14%), rgb(22 93 255 / 0%) 67%);
  filter: blur(20px);
}

.home-exploded-illustration__stage {
  position: absolute;
  inset: 10px 0 0;
  transform: perspective(1500px) rotateX(51deg) rotateZ(-29deg) scale(0.78);
  transform-origin: center 48%;
}

.home-exploded-illustration__layer {
  position: absolute;
  left: 50%;
  width: 520px;
  border: 1px solid rgb(188 204 232 / 76%);
  border-radius: 18px;
  background: var(--illustration-panel);
  box-shadow: var(--illustration-shadow);
  overflow: hidden;
  transform: translateX(-50%);
  backdrop-filter: blur(12px);
}

.layer--template {
  top: 0;
  height: 218px;
  padding: 18px 20px;
  animation: float-top 7s ease-in-out infinite;
}

.layer--layout {
  top: 238px;
  display: grid;
  grid-template-columns: 0.86fr 1fr 1.1fr;
  gap: 13px;
  height: 176px;
  padding: 20px;
  animation: float-middle 7s ease-in-out -2.3s infinite;
}

.layer--foundation {
  top: 432px;
  display: grid;
  grid-template-columns: 1.08fr 0.9fr 1.02fr;
  gap: 13px;
  height: 180px;
  padding: 20px;
  animation: float-bottom 7s ease-in-out -4.6s infinite;
}

.home-exploded-illustration__connectors {
  position: absolute;
  inset: 74px 0 0;
  z-index: 2;
  pointer-events: none;
}

.home-exploded-illustration__connector {
  position: absolute;
  display: block;
  height: 396px;
  border-left: 2px dashed rgb(22 93 255 / 42%);
}

.home-exploded-illustration__anchor {
  position: absolute;
  left: -6px;
  width: 9px;
  height: 9px;
  border: 3px solid var(--illustration-blue);
  border-radius: 50%;
  background: var(--illustration-panel);
  box-shadow: 0 0 0 3px rgb(22 93 255 / 9%);
  transform: translateY(-50%);
}

.anchor--template {
  top: 0;
}

.anchor--layout {
  top: 34%;
}

.anchor--foundation {
  top: 68%;
}

.anchor--base {
  top: 100%;
}

.connector--left {
  left: 11%;
}

.connector--right {
  right: 11%;
}

.browser-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--illustration-line);
}

.browser-bar__mark {
  width: 11px;
  height: 11px;
  border: 3px solid var(--illustration-blue);
  border-radius: 4px;
  transform: rotate(45deg);
}

.browser-bar__track {
  width: 68px;
  height: 5px;
  border-radius: 99px;
  background: #e5ecf7;
}

.browser-bar__dot {
  width: 6px;
  height: 6px;
  margin-left: auto;
  border-radius: 50%;
  background: #c3d0e8;
}

.template-layout {
  display: grid;
  grid-template-columns: 128px 1fr;
  gap: 24px;
  padding-top: 15px;
}

.template-layout__nav,
.ui-card,
.token-card {
  border: 1px solid #e1e9f5;
  border-radius: 10px;
  background: var(--illustration-card);
}

.template-layout__nav {
  display: grid;
  align-content: start;
  gap: 10px;
  padding: 13px;
}

.template-layout__nav span,
.copy-line,
.ui-card > span:not(.table-row),
.token-card--form > span {
  display: block;
  height: 7px;
  border-radius: 99px;
  background: #e5ecf7;
}

.template-layout__nav .is-active {
  background: var(--illustration-blue-soft);
}

.template-layout__nav .is-short,
.copy-line.is-short,
.ui-card > span.is-short {
  width: 62%;
}

.template-layout__content {
  display: grid;
  align-content: start;
  gap: 9px;
  padding: 5px 6px;
}

.template-layout__content p,
.ui-card p,
.token-card p {
  margin: 0;
  color: var(--illustration-muted);
  font-size: 8px;
  font-weight: 760;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.template-layout__content strong {
  color: var(--illustration-ink);
  font-size: 19px;
  letter-spacing: -0.055em;
}

.template-layout__actions,
.ui-card small,
.token-card small,
.token-card__shapes,
.token-card__swatches,
.token-card__controls {
  display: flex;
  align-items: center;
  gap: 7px;
}

.template-layout__actions {
  margin-top: 4px;
}

.template-layout__actions i,
.ui-card--navigation strong,
.ui-card em {
  display: inline-grid;
  min-height: 22px;
  place-items: center;
  border-radius: 6px;
  padding: 0 13px;
  background: var(--illustration-blue);
  color: #fff;
  font-size: 8px;
  font-style: normal;
  font-weight: 700;
  box-shadow: 0 5px 10px rgb(22 93 255 / 24%);
}

.template-layout__actions i + i {
  border: 1px solid #dce5f4;
  background: #fff;
  color: #687791;
  box-shadow: none;
}

.ui-card,
.token-card {
  display: grid;
  align-content: start;
  gap: 9px;
  min-width: 0;
  padding: 13px;
  box-shadow: 0 10px 18px rgb(45 69 107 / 7%);
}

.ui-card b {
  color: var(--illustration-ink);
  font-size: 10px;
}

.ui-card small {
  justify-content: end;
  color: var(--illustration-muted);
  font-size: 7px;
}

.ui-card em {
  min-height: 16px;
  padding: 0 8px;
  font-size: 7px;
}

.table-row {
  display: block;
  height: 12px;
  border-bottom: 1px solid #e5ecf7;
  background: linear-gradient(
    90deg,
    transparent 16%,
    #e5ecf7 16% 17%,
    transparent 17% 48%,
    #e5ecf7 48% 49%,
    transparent 49% 78%,
    #e5ecf7 78% 79%,
    transparent 79%
  );
}

.table-row.is-header {
  height: 15px;
  border-radius: 5px 5px 0 0;
  background-color: #edf3fc;
}

.token-card__shapes {
  gap: 12px;
  min-height: 26px;
}

.token-card__shapes i:nth-child(1) {
  width: 19px;
  height: 19px;
  background: var(--illustration-blue);
  box-shadow: 4px 4px 0 #dce8ff;
}

.token-card__shapes i:nth-child(2) {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #9eb7ff;
}

.token-card__shapes i:nth-child(3) {
  width: 0;
  height: 0;
  border-right: 10px solid transparent;
  border-bottom: 19px solid #a8b9ff;
  border-left: 10px solid transparent;
}

.token-card small b {
  display: grid;
  width: 25px;
  height: 21px;
  place-items: center;
  border: 1px solid #e0e8f4;
  border-radius: 7px;
  color: #52617c;
  font-size: 9px;
}

.token-card__swatches {
  gap: 10px;
  padding-top: 6px;
}

.token-card__swatches i {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--illustration-blue);
  box-shadow: 0 4px 9px rgb(22 93 255 / 25%);
}

.token-card__swatches i:nth-child(2) {
  background: #457dff;
}

.token-card__swatches i:nth-child(3) {
  background: #dbe5f7;
  box-shadow: none;
}

.token-card__controls {
  padding-top: 4px;
}

.token-card__controls i {
  display: grid;
  width: 16px;
  height: 16px;
  place-items: center;
  border-radius: 4px;
  background: var(--illustration-blue);
  color: #fff;
  font-size: 10px;
  font-style: normal;
  font-weight: 800;
}

.token-card__controls i + i {
  border: 4px solid #e2eafb;
  border-radius: 50%;
}

.token-card--form > span {
  height: 14px;
  border: 1px solid #dbe5f3;
  background: linear-gradient(90deg, #d7e0ef 38%, transparent 38%);
}

:global(.dark) .home-exploded-illustration {
  --illustration-ink: #edf3ff;
  --illustration-muted: #8f9fbe;
  --illustration-line: #33415a;
  --illustration-panel: rgb(22 30 46 / 91%);
  --illustration-card: rgb(27 37 57 / 91%);
  --illustration-shadow: 0 30px 58px rgb(0 0 0 / 32%);
}

:global(.dark) .home-exploded-illustration__layer,
:global(.dark) .template-layout__nav,
:global(.dark) .ui-card,
:global(.dark) .token-card {
  border-color: rgb(108 136 185 / 30%);
}

:global(.dark) .template-layout__nav span,
:global(.dark) .copy-line,
:global(.dark) .ui-card > span:not(.table-row),
:global(.dark) .token-card--form > span,
:global(.dark) .table-row.is-header {
  background-color: #34415b;
}

:global(.dark) .template-layout__actions i + i {
  border-color: #3a4862;
  background: #202c41;
  color: #b6c4dc;
}

@keyframes float-top {
  0%,
  100% {
    translate: 0 0;
  }
  50% {
    translate: 0 -9px;
  }
}

@keyframes float-middle {
  0%,
  100% {
    translate: 0 0;
  }
  50% {
    translate: 0 5px;
  }
}

@keyframes float-bottom {
  0%,
  100% {
    translate: 0 0;
  }
  50% {
    translate: 0 -5px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-exploded-illustration__layer {
    animation: none;
  }
}

@media (max-width: 767px) {
  .home-exploded-illustration {
    width: min(100%, 440px);
    min-height: 380px;
  }

  .home-exploded-illustration__stage {
    inset: 34px 0 8px;
    transform: perspective(1100px) rotateX(49deg) rotateZ(-28deg) scale(0.66);
  }

  .home-exploded-illustration__connectors {
    inset: 46px 0 0;
  }
  .home-exploded-illustration__connector {
    height: 247px;
  }
}
</style>
