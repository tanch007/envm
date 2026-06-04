import { defineConfig } from 'electron-vite'

export default defineConfig({
  main: {
    build:{
      outDir:'dist/main',
      sourcemap:true,
      rollupOptions:{
        input:'src/index.ts',
        output:{
          format:'es',
          minify:true,
          codeSplitting:false
        },
        external:['electron','better-sqlite3','7zip-bin']
      }
    }
  },
})