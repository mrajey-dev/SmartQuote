import { ref, onMounted } from 'vue'

const theme = ref('blue')

export function useColorTheme() {

  const applyTheme = () => {
    const root = document.documentElement

    root.classList.remove('theme-red', 'theme-blue', 'theme-black', 'theme-pink', 'theme-green')
    root.classList.add(`theme-${theme.value}`)

    localStorage.setItem('app-color-theme', theme.value)
  }

  const setTheme = (newTheme) => {
    theme.value = newTheme
    applyTheme()
  }

  onMounted(() => {
    const saved = localStorage.getItem('app-color-theme')
    if (saved) theme.value = saved
    applyTheme()
  })

  return { theme, setTheme }
}