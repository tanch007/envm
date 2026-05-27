import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    UnoCSS(),
    AutoImport({
        resolvers: [ElementPlusResolver()]
    }),
    Components({
        resolvers: [ElementPlusResolver()]
    })
  ],
  base:'./',
  server:{
    proxy:{
      '/api':'http://localhost:3212'
    }
  },
  //这里进行配置别名
  resolve: {
      alias: {
        "@": path.resolve("./src") // @代替src
      }
  }
})
