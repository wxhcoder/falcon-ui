<template>
  <div class="demo-col">
    <FlQrCode
      value="https://falcon-ui.dev"
      :size="160"
      :padding="12"
      icon-src="data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%230f172a'/%3E%3Cpath d='M20 41.5 31.5 22h5L21 41.5z' fill='white'/%3E%3Cpath d='M36 22h8l-9 19.5h-8z' fill='%233b82f6'/%3E%3C/svg%3E"
      :icon-size="36"
      icon-background-color="#ffffff"
      :icon-border-radius="10" />
  </div>
</template>
