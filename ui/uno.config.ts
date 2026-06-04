import { defineConfig,transformerDirectives,transformerVariantGroup } from 'unocss'
import presetWind4 from '@unocss/preset-wind4'
import presetIcons from '@unocss/preset-icons'
// import icons from './src/comm/icons'

export default defineConfig({
    presets:[
        presetWind4({
            dark: '[data-appearance="dark"]'
        }),
        presetIcons({
            collections: {
                mdi: () => import("@iconify-json/mdi/icons.json").then(i => i.default)
            }
        })
    ],
    // safelist:icons.Medical,
    transformers: [
        transformerDirectives(),
        transformerVariantGroup()
    ],
})