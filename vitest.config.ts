import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    include: ['packages/**/__test__/*.test.ts', 'docs/**/__test__/*.test.ts']
  }
})
