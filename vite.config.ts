import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import * as fs from 'fs'

// 自定义插件：复制 manifest.json 到 dist 并处理 index.html 重命名
const copyAndRename = () => ({
  name: 'copy-and-rename',
  closeBundle() {
    // 复制 manifest.json 到 dist
    fs.copyFileSync('manifest.json', 'dist/manifest.json')
    // 检查 dist 目录是否存在 index.html
    if (fs.existsSync('dist/index.html')) {
      // 重命名 index.html 为 popup.html
      fs.renameSync('dist/index.html', 'dist/popup.html')
    }
  },
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), copyAndRename()],
  base: './', // 使用相对路径，解决 Chrome 扩展路径问题
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'src/background.ts'),
        content: resolve(__dirname, 'src/content.tsx'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') {
            return 'background.js'
          }
          if (chunkInfo.name === 'content') {
            return 'content.js'
          }
          return 'assets/[name]-[hash].js'
        },
        // 确保 CSS 文件也有固定的路径
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/style.css'
          }
          return 'assets/[name]-[hash].[ext]'
        },
      },
    },
  },
})
