import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tarojs/taro': path.resolve(__dirname, './src/test/mocks/taro.ts'),
      '@nutui/nutui-react-taro': path.resolve(__dirname, './src/test/mocks/nutui.tsx'),
      '@tarojs/components': path.resolve(__dirname, './src/test/mocks/taro-components.tsx'),
    },
  },
})
