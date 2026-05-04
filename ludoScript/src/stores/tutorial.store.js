import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTutorialStore = defineStore('tutorial', () => {
  const step = ref(0)
  const isVisible = ref(false) // Oculto por defecto; initTutorial decide si mostrarlo

  function initTutorial(firstLoginFromDB) {
    const isFirstLogin = firstLoginFromDB === true || firstLoginFromDB === 'true'

    // El tutorial se muestra SOLO si la base de datos indica primer login.
    if (isFirstLogin) {
      isVisible.value = true
      step.value = 0
      completeTutorial().catch((err) => {
        console.error('Error al completar tutorial al abrirlo:', err)
      })
    } else {
      isVisible.value = false
    }
  }

  async function completeTutorial() {
    try {
      const authModule = await import('@/stores/auth.store')
      const authStore = authModule.useAuthStore()
      if (!authStore.user?.id || !authStore.userData?.first_login) return

      const authServiceModule = await import('@/api/auth.service')
      await authServiceModule.authService.completeTutorial()
      authStore.userData.first_login = false
    } catch (err) {
      console.error('Error al marcar tutorial completado:', err)
    }
  }

  function nextStep() {
    step.value++
  }

  async function closeTutorial() {
    isVisible.value = false
    await completeTutorial()
  }

  function resetTutorial() {
    step.value = 0
    isVisible.value = true
  }

  return { step, isVisible, initTutorial, nextStep, closeTutorial, resetTutorial }
})