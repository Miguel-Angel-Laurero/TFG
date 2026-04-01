// composables/useActivitySession.js
// ─────────────────────────────────────────────────────────────────────────────
// Composable GENÉRICO que encapsula el ciclo de vida común a cualquier
// actividad (Quiz, FlashCard, etc.):
//
//   1. Cargar un JSON desde /public
//   2. Barajar los items
//   3. Navegar entre ellos (índice, siguiente, reiniciar)
//   4. Sincronizar la barra de progreso de InGame.vue via useGameProgress
//   5. Marcar la actividad como finalizada
//
// Cada actividad instancia este composable pasando su URL de JSON.
// La lógica específica (puntuación, volteo…) se añade encima en cada componente.
// ─────────────────────────────────────────────────────────────────────────────
import { ref, computed } from 'vue'
import { useGameProgress } from '@/composables/useGameProgress'

/**
 * @param {string} jsonUrl - Ruta al JSON en /public (ej. '/quizQuestions.json')
 */
export function useActivitySession(jsonUrl) {
  const { updateProgress, resetProgress } = useGameProgress()

  // ─── Estado ──────────────────────────────────────────────────────────────
  const items        = ref([])
  const loading      = ref(true)
  const finished     = ref(false)
  const currentIndex = ref(0)

  // ─── Computadas ──────────────────────────────────────────────────────────
  const currentItem = computed(() => items.value[currentIndex.value])
  const totalItems  = computed(() => items.value.length)
  const isLastItem  = computed(() => currentIndex.value + 1 >= totalItems.value)

  // ─── Helpers ─────────────────────────────────────────────────────────────
  function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5)
  }

  // ─── Acciones ────────────────────────────────────────────────────────────

  /** Carga el JSON, baraja los items e inicializa la barra de progreso. */
  async function load() {
    loading.value = true
    try {
      const res  = await fetch(jsonUrl)
      const data = await res.json()
      items.value = shuffle(data)
      resetProgress()
    } catch (e) {
      console.error(`[useActivitySession] Error cargando ${jsonUrl}`, e)
    } finally {
      loading.value = false
    }
  }

  /**
   * Avanza al siguiente item o marca la actividad como finalizada.
   * @param {() => void} [onReset] - Callback para que la actividad limpie
   *   su estado local (respuesta seleccionada, isFlipped…) antes de avanzar.
   */
  function next(onReset) {
    const nextIndex = currentIndex.value + 1
    updateProgress((nextIndex / totalItems.value) * 100)

    if (nextIndex >= totalItems.value) {
      finished.value = true
      updateProgress(100)
    } else {
      onReset?.()
      currentIndex.value = nextIndex
    }
  }

  /**
   * Reinicia la sesión barajando de nuevo los items.
   * @param {() => void} [onReset] - Callback para limpiar estado local.
   */
  function restart(onReset) {
    onReset?.()
    items.value        = shuffle(items.value)
    currentIndex.value = 0
    finished.value     = false
    resetProgress()
  }

  return {
    items,
    loading,
    finished,
    currentIndex,
    currentItem,
    totalItems,
    isLastItem,
    load,
    next,
    restart,
  }
}
