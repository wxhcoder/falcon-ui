<template>
  <section class="page">
    <h2 class="page-title">Home</h2>
    <p class="page-desc">
      This stage focuses on a lightweight play shell for navigation and later component previews.
    </p>
    <div class="card-grid">
      <article class="card">
        <h3>Current Stage</h3>
        <p>Play shell first, component implementation later.</p>
      </article>
      <article class="card">
        <h3>Workspace Integration</h3>
        <p>
          `@falcon-ui/falcon-ui` imports are available.
          <br />
          Export count: {{ exportCount }}
        </p>
      </article>
      <article class="card">
        <h3>Next Milestone</h3>
        <p>Add real Button and Input demos into the placeholders.</p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import * as FalconUI from '@falcon-ui/falcon-ui'

const exportCount = Object.keys(FalconUI).length
</script>
