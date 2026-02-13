<template>
  <section class="page">
    <h2 class="page-title">Components</h2>
    <p class="page-desc">Element Plus passthrough wrappers: FButton and FInput.</p>

    <article class="card demo-card">
      <h3>FButton</h3>
      <div class="demo-row">
        <FButton class="dddd">Default</FButton>
        <FButton type="primary">Primary</FButton>
        <FButton type="success" plain>Success Plain</FButton>
        <FButton type="warning" round>Warning Round</FButton>
      </div>
      <div class="demo-row">
        <FButton :disabled="true">Disabled</FButton>
        <FButton :loading="true" type="primary">Loading</FButton>
        <FButton type="primary" @click="buttonClicks += 1">Click +1</FButton>
      </div>
      <p class="demo-result">Click count: {{ buttonClicks }}</p>
    </article>

    <article class="card demo-card">
      <h3>FInput</h3>
      <div class="demo-row">
        <FInput
          v-model="inputValue"
          placeholder="Type something..."
          clearable
          @input="inputEvents += 1"
          @custom-input="handleCustomInput">
          <template #prefix>
            <span>@</span>
          </template>
        </FInput>
      </div>
      <div class="demo-row">
        <FInput v-model="iconInputValue" placeholder="Input with icon slot">
          <template #prefix>
            <ElIcon>
              <Search />
            </ElIcon>
          </template>
        </FInput>
      </div>
      <div class="demo-row">
        <FInput v-model="disabledValue" placeholder="Disabled input" disabled />
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
import { FButton, FInput } from '@falcon-ui/falcon-ui'

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
