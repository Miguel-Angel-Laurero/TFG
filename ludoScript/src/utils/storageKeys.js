import { useAuthStore } from '@/stores/auth.store'

export function userScopedStorageKey(baseKey) {
  try {
    const authStore = useAuthStore()
    const userId = authStore.user?.id
    return userId ? `${baseKey}_user_${userId}` : baseKey
  } catch {
    return baseKey
  }
}
