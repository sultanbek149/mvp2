export default defineNuxtPlugin(() => {
  const isDark = useColorMode()
  return { provide: { isDark } }
})

export const useColorMode = () => {
  const dark = useState('dark_mode', () => false)

  const init = () => {
    if (process.client) {
      const saved = localStorage.getItem('theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      dark.value = saved ? saved === 'dark' : prefersDark
      applyClass()
    }
  }

  const toggle = () => {
    dark.value = !dark.value
    if (process.client) {
      localStorage.setItem('theme', dark.value ? 'dark' : 'light')
      applyClass()
    }
  }

  const applyClass = () => {
    document.documentElement.classList.toggle('dark', dark.value)
  }

  return { dark, toggle, init }
}
