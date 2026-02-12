<template>
  <div class="play-layout">
    <header class="play-header">
      <h1 class="play-title">Falcon UI Play</h1>
      <nav class="play-nav">
        <RouterLink class="play-link" to="/">Home</RouterLink>
        <RouterLink class="play-link" to="/components">Components</RouterLink>
        <RouterLink class="play-link" to="/playground">Playground</RouterLink>
      </nav>
    </header>
    <main class="play-main">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts"></script>
