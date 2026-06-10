<template>
  <Toast />
  <RouterView />
  <ConfirmDialog />
  <!-- Banner global de invitación a duelo (requiere auth) -->
  <DuelInvitationBanner v-if="auth.hasToken" />
  <GroupInvitationBanner v-if="auth.hasToken" />
</template>

<script setup>
import { RouterView } from 'vue-router'
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog'
import DuelInvitationBanner from '@/components/shared/DuelInvitationBanner.vue'
import GroupInvitationBanner from '@/components/shared/GroupInvitationBanner.vue'

import { onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth.store'

const auth = useAuthStore()

// ── Warm-up y keep-alive para Render ──────────────────────────────────────

function getBackendBaseUrl() {
  return (
    import.meta.env.VITE_SOCKET_URL ??
    import.meta.env.VITE_API_URL?.replace('/api', '') ??
    'http://localhost:3000'
  )
}

let keepAliveTimer = null

function startKeepAlive() {
  if (keepAliveTimer) return
  const baseUrl = getBackendBaseUrl()
  keepAliveTimer = setInterval(() => {
    fetch(`${baseUrl}/health`).catch(() => {})
  }, 300_000)
}

function stopKeepAlive() {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer)
    keepAliveTimer = null
  }
}

// Mantener backend despierto mientras haya sesión activa
watch(() => auth.isLoggedIn, (loggedIn) => {
  if (loggedIn) startKeepAlive()
  else stopKeepAlive()
})

onMounted(async () => {
  // Despertar Render inmediatamente (no bloquea el renderizado)
  const baseUrl = getBackendBaseUrl()
  fetch(`${baseUrl}/health`).catch(() => {})

  if (auth.hasToken) {
    await auth.fetchMe()
    // El keep-alive se activa automáticamente vía el watch de isLoggedIn
    // Hidrata el localStorage con los PDFs de la nube al recargar la página
    try {
      const { pdfService } = await import('@/api/pdf.service')
      const { syncPdfsFromServer } = await import('@/composables/useAdaptiveSelection')
      const { data: pdfs } = await pdfService.syncAll()
      syncPdfsFromServer(pdfs)
    } catch {
      // Error no crítico: el usuario puede seguir usando la app sin sincronización
    }
  } else {
    auth.ready = true  // si no hay token, marcar como listo igualmente
  }
})

onUnmounted(() => {
  stopKeepAlive()
})
</script>

<style scoped>
</style>

