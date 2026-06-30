import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/tests/**/*.spec.js',
      '**/tests/**/*.spec.ts',
      '**/*.spec.js',
      '**/*.spec.ts',
      '**/.{idea,git,cache,output,temp}/**'
    ],
  },
})
