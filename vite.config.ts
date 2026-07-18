import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    port: 3000,
    // Pre-transform app modules at server start so first page load is instant
    // (avoids cold-transform blank pages in dev and e2e runs).
    warmup: {
      clientFiles: ['./src/router.tsx', './src/routeTree.gen.ts', './src/routes/**/*.tsx', './src/components/**/*.tsx'],
      ssrFiles: ['./src/router.tsx', './src/routeTree.gen.ts', './src/routes/**/*.tsx', './src/components/**/*.tsx'],
    },
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tanstackStart(),
    viteReact(),
    tailwindcss(),
  ],
})
