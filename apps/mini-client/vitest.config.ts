import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  define: {
    'ENABLE_INNER_HTML': 'true',
    'ENABLE_ADJACENT_HTML_TEMPLATE': 'true',
    'ENABLE_ADJACENT_HTML': 'true',
    'ENABLE_SIZE_APIS': 'true',
    'ENABLE_TEMPLATE_CONTENT': 'true',
    'ENABLE_CLONE_NODE': 'true',
    'ENABLE_CONTAINS': 'true',
    'ENABLE_MUTATION_OBSERVER': 'true',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.tsx'],
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
})
