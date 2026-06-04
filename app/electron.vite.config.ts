import { defineConfig } from 'electron-vite'

export default defineConfig(({ mode }) => ({
  main: {
    build:{
      outDir:'dist/main',
      sourcemap: true,
      minify: mode === 'production',
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