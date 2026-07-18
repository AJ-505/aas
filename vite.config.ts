import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

export default defineConfig({
  server: {
    port: 3000,
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
    nitro(),
    viteReact(),
    tailwindcss(),
  ],
})
