import { useAuthStore } from '@/stores/auth.store'

export function userScopedStorageKey(baseKey) {
  try {
    const authStore = useAuthStore()
    const userId = authStore.user?.id
    // Si no hay userId, usamos un sufijo anónimo para evitar leer/escribir
    // en una clave compartida que podría contener datos de otro usuario.
    return userId ? `${baseKey}_user_${userId}` : `${baseKey}_anonymous`
  } catch {
    return `${baseKey}_anonymous`
  }
}
