<template>
  <section class="page">
    <h2 class="page-title">Components</h2>
    <p class="page-desc">Element Plus passthrough wrappers: FlButton and FlInput.</p>

    <article class="card demo-card">
      <h3>FlButton</h3>
      <div class="demo-row">
        <FlButton class="dddd">Default</FlButton>
        <FlButton type="primary">Primary</FlButton>
        <FlButton type="success" plain>Success Plain</FlButton>
        <FlButton type="warning" round>Warning Round</FlButton>
      </div>
      <div class="demo-row">
        <FlButton :disabled="true">Disabled</FlButton>
        <FlButton :loading="true" type="primary">Loading</FlButton>
        <FlButton type="primary" @click="buttonClicks += 1">Click +1</FlButton>
      </div>
      <p class="demo-result">Click count: {{ buttonClicks }}</p>
    </article>

    <article class="card demo-card">
      <h3>FlInput</h3>
      <div class="demo-row">
        <FlInput
          v-model="inputValue"
          placeholder="Type something..."
          clearable
          @input="inputEvents += 1"
          @custom-input="handleCustomInput">
          <template #prefix>
            <span>@</span>
          </template>
        </FlInput>
      </div>
      <div class="demo-row">
        <FlInput v-model="iconInputValue" placeholder="Input with icon slot">
          <template #prefix>
            <ElIcon>
              <Search />
            </ElIcon>
          </template>
        </FlInput>
      </div>
      <div class="demo-row">
        <FlInput v-model="disabledValue" placeholder="Disabled input" disabled />
      </div>
      <p class="demo-result">Current value: {{ inputValue || '(empty)' }}</p>
      <p class="demo-result">Icon slot value: {{ iconInputValue || '(empty)' }}</p>
      <p class="demo-result">Input events: {{ inputEvents }}</p>
      <p class="demo-result">Custom input events: {{ customInputEvents }}</p>
      <p class="demo-result">Custom payload: {{ customInputPayload || '(none)' }}</p>
      <p class="demo-result">Change events: {{ changeEvents }}</p>
    </article>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElIcon } from 'element-plus'

const buttonClicks = ref(0)
const inputValue = ref('')
const iconInputValue = ref('')
const disabledValue = ref('disabled text')
const inputEvents = ref(0)
const customInputEvents = ref(0)
const customInputPayload = ref('')
const changeEvents = ref(0)

const handleCustomInput = (payload: { length: number; value: string }) => {
  customInputEvents.value += 1
  customInputPayload.value = `value="${payload.value}" length=${payload.length}`
}
</script>

<style scoped>
.demo-card {
  margin-bottom: 12px;
}

.demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 10px 0;
}

.demo-result {
  margin: 6px 0 0;
}
</style>
