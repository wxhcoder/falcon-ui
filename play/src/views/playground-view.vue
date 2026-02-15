<template>
  <section class="page">
    <h2 class="page-title">Playground</h2>
    <p class="page-desc">
      Element Plus theme customization preview: primary color and border radius.
    </p>

    <div class="playground-grid">
      <article class="card control-card">
        <h3>Theme Controls</h3>

        <div class="control-item">
          <label class="control-label" for="primary-color">Primary Color</label>
          <div class="control-main">
            <ElColorPicker id="primary-color" v-model="primaryColor" />
            <span class="value-tag">{{ primaryColor }}</span>
          </div>
        </div>

        <div class="control-item">
          <label class="control-label" for="radius-slider">Radius Base</label>
          <div class="control-main control-main-slider">
            <ElSlider id="radius-slider" v-model="borderRadius" :max="20" :min="2" :step="1" />
            <span class="value-tag">{{ borderRadius }}px</span>
          </div>
        </div>

        <div class="action-row">
          <FButton plain @click="resetTheme">Reset</FButton>
        </div>
      </article>

      <article class="card demo-card">
        <h3>Live Preview</h3>
        <div class="demo-row">
          <FButton>Default</FButton>
          <FButton type="primary">Primary</FButton>
          <FButton type="success" plain>Success Plain</FButton>
          <FButton type="warning" round>Warning Round</FButton>
        </div>

        <div class="demo-row">
          <ElButton type="primary">ElButton Primary</ElButton>
          <ElButton plain type="primary">ElButton Plain</ElButton>
          <ElButton round type="primary">ElButton Round</ElButton>
        </div>

        <div class="demo-row">
          <FInput v-model="inputValue" clearable placeholder="Type to preview input radius..." />
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElColorPicker, ElSlider } from 'element-plus'
import { useElementTheme } from '../composables/use-element-theme'

const inputValue = ref('')
const { primaryColor, borderRadius, resetTheme } = useElementTheme()
</script>

<style scoped>
.playground-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.control-card,
.demo-card {
  min-height: 100%;
}

.control-item {
  margin-top: 12px;
}

.control-label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--play-text-secondary);
}

.control-main {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-main-slider {
  align-items: flex-start;
}

.control-main-slider :deep(.el-slider) {
  flex: 1;
}

.value-tag {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 8px;
  border: 1px solid var(--play-border);
  border-radius: 8px;
  font-size: 12px;
  color: var(--play-text-secondary);
  background: var(--play-surface);
}

.action-row {
  display: flex;
  margin-top: 14px;
}

.demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 12px 0;
}
</style>
