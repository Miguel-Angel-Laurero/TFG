import { ref, watch } from 'vue'

const isDark = ref(localStorage.getItem('ls-theme') === 'dark')

watch(isDark, (val) => {
  localStorage.setItem('ls-theme', val ? 'dark' : 'light')
  document.documentElement.classList.toggle('dark', val)
}, { immediate: true })

export function useTheme() {
  const toggleTheme = () => { isDark.value = !isDark.value }
  return { isDark, toggleTheme }
}
