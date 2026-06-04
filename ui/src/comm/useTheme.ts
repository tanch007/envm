import { ref, watch } from 'vue'

type Appearance = 'light' | 'dark'

const STORAGE_KEY = 'envm-appearance'

function getStoredAppearance(): Appearance {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyAppearance(appearance: Appearance) {
  document.documentElement.setAttribute('data-appearance', appearance)
  if (appearance === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const appearance = ref<Appearance>(getStoredAppearance())

// Apply on first load
applyAppearance(appearance.value)

watch(appearance, (val) => {
  localStorage.setItem(STORAGE_KEY, val)
  applyAppearance(val)
})

export function useTheme() {
  function toggle() {
    appearance.value = appearance.value === 'dark' ? 'light' : 'dark'
  }

  function setTheme(val: Appearance) {
    appearance.value = val
  }

  return {
    appearance,
    toggle,
    setTheme,
  }
}
