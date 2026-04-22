<template>
  <Toast/>
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

import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useDuelStore } from '@/stores/duel.store'
import { useGroupStore } from '@/stores/group.store'

const auth = useAuthStore()
const duel = useDuelStore()
const group = useGroupStore()

onMounted(async () => {
  if (auth.hasToken) {
    await auth.fetchMe()
    // Registrar listeners de duelo para recibir invitaciones en cualquier pantalla
    duel.setupListeners()
    group.connectNotifications()
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
</script>

<style scoped>
</style>

