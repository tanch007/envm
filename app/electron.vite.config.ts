import { defineConfig } from 'electron-vite'

export default defineConfig(({ mode }) => ({
  main: {
    build:{
      outDir:'dist/main',
      externalizeDeps: {
        exclude: [
          'hono',
          '@hono/node-server',
          'drizzle-orm',
          'ws',
          'fs-extra',
          'moment',
          'radashi',
          'nanoid',
          'node-fetch',
          'node-downloader-manager',
          '7zip-min'
        ]
      },
      rollupOptions:{
        input:'src/index.ts',
        output:{
          format:'es',
          codeSplitting:false
        },
        external:['electron','better-sqlite3','7zip-bin']
      }
    }
  },
}))