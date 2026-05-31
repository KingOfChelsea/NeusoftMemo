import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // build: {
  //   outDir: 'dist',
  //   minify: 'terser', // 需要先安装 terser
  //   terserOptions: {
  //     compress: {
  //       drop_console: true,
  //       drop_debugger: true,
  //       // 更多压缩选项
  //       pure_funcs: ['console.log'], // 只移除 console.log，保留其他 console
  //     },
  //     mangle: {
  //       safari10: true, // 兼容 Safari 10
  //     },
  //   },

  //   rollupOptions: {
  //     output: {
  //       // 更好的代码分割
  //       manualChunks(id) {
  //         if (id.includes('node_modules')) {
  //           if (id.includes('vue')) {
  //             return 'vue-vendor'
  //           }
  //           if (id.includes('element-plus')) {
  //             return 'element-plus-vendor'
  //           }
  //           if (id.includes('lodash')) {
  //             return 'lodash-vendor'
  //           }
  //           // 其他依赖打包到 libs
  //           return 'libs'
  //         }
  //       },
  //       // 优化 chunk 文件名
  //       chunkFileNames: 'assets/js/[name]-[hash].js',
  //       entryFileNames: 'assets/js/[name]-[hash].js',
  //       assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
  //     },
  //   },

  //   // 提高 chunk 大小警告阈值
  //   chunkSizeWarningLimit: 1000,

  //   // 构建报告
  //   reportCompressedSize: false, // 关闭 gzip 大小报告（可选的）

  //   // 目标环境
  //   target: 'es2015',
  // },
})
