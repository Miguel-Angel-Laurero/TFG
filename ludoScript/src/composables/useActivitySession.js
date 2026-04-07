// composables/useActivitySession.js
// ─────────────────────────────────────────────────────────────────────────────
// Composable GENÉRICO que encapsula el ciclo de vida común a cualquier
// actividad (Quiz, FlashCard, etc.):
//
//   1. Cargar un JSON (desde /public o desde la API autenticada)
//   2. Barajar los items
//   3. Navegar entre ellos (índice, siguiente, reiniciar)
//   4. Sincronizar la barra de progreso de InGame.vue via useGameProgress
//   5. Marcar la actividad como finalizada
//
// Soporta dos tipos de fuente de datos:
//   - Rutas estáticas ("/quizQuestions.json")  → fetch() sin autenticación
//   - Rutas de la API ("/api/pdfs/:id/quiz")   → axios con JWT automático
//
// Cada actividad instancia este composable pasando su URL de JSON.
// La lógica específica (puntuación, volteo…) se añade encima en cada componente.
// ─────────────────────────────────────────────────────────────────────────────
import { ref, computed } from "vue";
import { useGameProgress } from "@/composables/useGameProgress";
// Instancia axios con el interceptor de JWT, usada solo cuando la URL es de la API
import api from "@/api/axios";

/**
 * @param {string} jsonUrl - Ruta al JSON en /public (ej. '/quizQuestions.json')
 */
export function useActivitySession(jsonUrl) {
  const { updateProgress, resetProgress } = useGameProgress();

  // ─── Estado ──────────────────────────────────────────────────────────────
  const items = ref([]);
  const loading = ref(true);
  const finished = ref(false);
  const currentIndex = ref(0);

  // ─── Computadas ──────────────────────────────────────────────────────────
  const currentItem = computed(() => items.value[currentIndex.value]);
  const totalItems = computed(() => items.value.length);
  const isLastItem = computed(() => currentIndex.value + 1 >= totalItems.value);

  // ─── Helpers ─────────────────────────────────────────────────────────────
  function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
  }

  // ─── Acciones ────────────────────────────────────────────────────────────

  /** Carga una URL (string) y devuelve el array de items. */
  async function fetchOne(url) {
    if (url.startsWith("/api/")) {
      // Ruta de la API del backend: usa axios para enviar el JWT automáticamente.
      // Se elimina el prefijo "/api" porque el baseURL de axios ya lo incluye.
      const res = await api.get(url.slice(4));
      return res.data;
    } else {
      // Ruta estática de /public: fetch simple sin autenticación.
      const res = await fetch(url);
      return await res.json();
    }
  }

  /** Carga el JSON (o combina varios JSONs), baraja los items e inicializa la barra de progreso. */
  async function load() {
    loading.value = true;
    try {
      // jsonUrl puede ser un string (una sola fuente) o un array (múltiples PDFs)
      const urls = Array.isArray(jsonUrl) ? jsonUrl : [jsonUrl];
      const results = await Promise.all(urls.map(fetchOne));
      // Combina todos los arrays en uno y baraja
      items.value = shuffle(results.flat());
      resetProgress();
    } catch (e) {
      console.error(`[useActivitySession] Error cargando`, e);
    } finally {
      loading.value = false;
    }
  }

  /**
   * Avanza al siguiente item o marca la actividad como finalizada.
   * @param {() => void} [onReset] - Callback para que la actividad limpie
   *   su estado local (respuesta seleccionada, isFlipped…) antes de avanzar.
   */
  function next(onReset) {
    const nextIndex = currentIndex.value + 1;
    updateProgress((nextIndex / totalItems.value) * 100);

    if (nextIndex >= totalItems.value) {
      finished.value = true;
      updateProgress(100);
    } else {
      onReset?.();
      currentIndex.value = nextIndex;
    }
  }

  /**
   * Reinicia la sesión barajando de nuevo los items.
   * @param {() => void} [onReset] - Callback para limpiar estado local.
   */
  function restart(onReset) {
    onReset?.();
    items.value = shuffle(items.value);
    currentIndex.value = 0;
    finished.value = false;
    resetProgress();
  }

  /**
   * Carga items ya procesados (sin fetch) — usado por Quiz en modo adaptativo
   * y en modo PDF desde localStorage. Los items se barajan igualmente.
   * @param {Array} inputItems - Array de preguntas/items pre-filtrados
   */
  async function loadDirect(inputItems) {
    loading.value = true;
    try {
      items.value = shuffle(inputItems);
      resetProgress();
    } finally {
      loading.value = false;
    }
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
    loadDirect,
    next,
    restart,
  };
}
