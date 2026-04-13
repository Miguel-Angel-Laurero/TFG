import { ref } from "vue";
import { useActivitySession } from "@/composables/useActivitySession";
import { categoryStatsService } from "@/api/categoryStats.service";
import {
  pickRandomIds,
  filterByIds,
  hasPdfInStorage,
  loadPdfQuestionsFromStorage,
  selectAdaptiveQuestions,
} from "@/composables/useAdaptiveSelection";

/**
 * Composable que encapsula las distintas formas de cargar las preguntas
 * (estático, PDF local, mixto, adaptativo). Devuelve la API de
 * `useActivitySession` y funciones de carga independientes para poder
 * probar cada fase aisladamente.
 *
 * @param {object} options
 * @param {string} options.jsonUrl - URL por defecto al banco estático
 * @param {(id: string) => void} [options.setPdfSource] - callback para indicar la fuente PDF
 */
export function useQuizLoader({
  jsonUrl = "/quizQuestions.json",
  setPdfSource,
} = {}) {
  const {
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
  } = useActivitySession(jsonUrl);

  const loadError = ref(false);
  const adaptiveWeakCategories = ref([]);

  // Modo estático: 15 preguntas aleatorias del banco JS
  async function loadStaticMode() {
    try {
      const res = await fetch(jsonUrl);
      const allQ = await res.json();
      const ids = pickRandomIds(allQ, Math.min(15, allQ.length));
      await loadDirect(filterByIds(allQ, ids));
    } catch (e) {
      loadError.value = true;
      await loadDirect([]);
    }
  }

  // Modo PDF local: usa preguntas y IDs activos guardados en localStorage
  async function loadPdfLocalMode(pdfId) {
    const stored = loadPdfQuestionsFromStorage(pdfId);
    if (!stored) {
      loadError.value = true;
      await loadDirect([]);
      return;
    }
    setPdfSource?.(pdfId);
    const activeItems = filterByIds(stored.questions, stored.activeIds);
    await loadDirect(activeItems);
  }

  // Modo mixto: PDF (10) + estático (5)
  async function loadMixedMode(pdfId) {
    const stored = loadPdfQuestionsFromStorage(pdfId);
    if (!stored) {
      loadError.value = true;
      await loadDirect([]);
      return;
    }
    setPdfSource?.(pdfId);
    const pdfItems = filterByIds(stored.questions, stored.activeIds).slice(
      0,
      10,
    );
    try {
      const res = await fetch(jsonUrl);
      const staticQ = await res.json();
      const staticItems = filterByIds(staticQ, pickRandomIds(staticQ, 5));
      await loadDirect([...pdfItems, ...staticItems]);
    } catch (e) {
      await loadDirect(pdfItems);
    }
  }

  // Modo adaptativo: llama al endpoint y selecciona 15 preguntas aleatorias
  async function loadAdaptiveMode() {
    try {
      const [questionsRes, statsRes] = await Promise.all([
        fetch(jsonUrl),
        categoryStatsService.getAll(),
      ]);
      const allQuestions = await questionsRes.json();
      const { questions, weakCategories } = selectAdaptiveQuestions(
        allQuestions,
        statsRes.data ?? [],
        15,
      );

      if (!questions.length) {
        await loadStaticMode();
        return;
      }

      adaptiveWeakCategories.value = weakCategories ?? [];
      await loadDirect(questions);
    } catch (e) {
      await loadStaticMode();
    }
  }

  /** Inicializador que replica la lógica previa de `onMounted` en Quiz.vue
   *  Acepta un objeto `route` (vue-router) y decide qué modo cargar.
   */
  async function initFromRoute(route) {
    loadError.value = false;
    const isAdaptive = route.query.adaptive === "true";
    const pdfIdsList = route.query.pdfIds?.split(",").filter(Boolean) ?? [];
    const hasPdfQuery = pdfIdsList.length > 0 || !!route.query.pdfId;

    if (isAdaptive) {
      await loadAdaptiveMode();
      return;
    }

    if (hasPdfQuery) {
      const pdfId = pdfIdsList[0] ?? route.query.pdfId;
      const includePredefined = route.query.includePredefined === "true";
      if (!hasPdfInStorage(pdfId)) {
        loadError.value = true;
        await loadDirect([]);
      } else if (includePredefined) {
        await loadMixedMode(pdfId);
      } else {
        await loadPdfLocalMode(pdfId);
      }
      return;
    }

    await loadStaticMode();
  }

  return {
    // Passthrough desde useActivitySession
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

    // Estado propio
    loadError,
    adaptiveWeakCategories,

    // Operaciones públicas y testables
    loadStaticMode,
    loadPdfLocalMode,
    loadMixedMode,
    loadAdaptiveMode,
    initFromRoute,
  };
}
