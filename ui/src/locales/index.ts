import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import en from './en'

// 检测浏览器语言，默认中文
function getBrowserLocale(): string {
  // 优先读取 localStorage 中保存的语言偏好
  const stored = localStorage.getItem('envm-locale')
  if (stored === 'zh-CN' || stored === 'en') return stored

  const lang = navigator.language || (navigator as any).browserLanguage || 'zh-CN'
  if (lang.startsWith('zh')) return 'zh-CN'
  return 'en'
}

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: getBrowserLocale(),
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en': en,
  },
})

export default i18n
