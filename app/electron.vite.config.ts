import { defineConfig } from 'electron-vite'

export default defineConfig({
  main: {
    build:{
      outDir:'dist',
      rollupOptions:{
        input:'src/index.ts',
        output:{
          format:'es',
          minify:true,
          codeSplitting:false
        },
        external:['electron','better-sqlite3']
      }
    }
  },
})