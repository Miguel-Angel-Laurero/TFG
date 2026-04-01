// composables/useGameExit.js
// ─────────────────────────────────────────────────────────────────────────────
// Encapsula la lógica de "salir del minijuego" con confirmación PrimeVue v4.
//
// Uso:
//   const { confirmExit } = useGameExit()
//   <button @click="confirmExit">Salir</button>
//
// Requisito: <ConfirmDialog /> debe estar montado en un ancestro (App.vue).
// ─────────────────────────────────────────────────────────────────────────────
import { useConfirm } from 'primevue/useconfirm'
import { useRouter }  from 'vue-router'

export function useGameExit() {
  const confirm = useConfirm()
  const router  = useRouter()

  function confirmExit() {
    confirm.require({
      message:      '¿Seguro que quieres salir? Se perderá el progreso actual.',
      header:       'Salir del minijuego',
      icon:         'pi pi-exclamation-triangle',
      rejectLabel:  'Cancelar',
      acceptLabel:  'Salir',
      acceptClass:  'p-button-danger',
      accept: () => router.push('/'),
    })
  }

  return { confirmExit }
}