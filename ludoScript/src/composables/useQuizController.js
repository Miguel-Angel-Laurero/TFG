import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { categoryStatsService } from "@/api/categoryStats.service";
import { gameService } from "@/api/game.service";
import { getSessionSummary } from "@/composables/useSessionTracker";
import { calculateWeakCategories } from "@/composables/useAdaptiveSelection";

/**
 * Controlador de acciones del Quiz: selección, siguiente, reiniciar y cálculo
 * de resultados finales. Diseñado para inyectar dependencias y facilitar tests.
 *
 * @param {object} opts
 */
export function useQuizController(opts = {}) {
  const {
    currentItem,
    currentIndex,
    totalItems,
    isLastItem,
    next,
    restart,
    trackAnswer,
    submitSession,
    resetSession,
    grantQuizReward,
    rankLabelRef,
    gameService: gameSvc = gameService,
    categoryStatsService: categorySvc = categoryStatsService,
    getSessionSummaryFn = getSessionSummary,
    calcWeakCategories = calculateWeakCategories,
    router: routerParam,
  } = opts;

  const selectedAnswer = ref(null);
  const answered = ref(false);
  const results = ref([]);
  const weakCategoriesAfterQuiz = ref([]);

  function initResults(len) {
    results.value = new Array(len).fill(null);
  }

  function selectAnswer(idx) {
    if (answered.value) return;
    selectedAnswer.value = idx;
    answered.value = true;
    const isCorrect = idx === currentItem.value.correct;
    results.value[currentIndex.value] = isCorrect;
    trackAnswer?.(
      currentItem.value.category,
      isCorrect,
      currentItem.value.id,
      currentItem.value.difficulty ?? null,
      currentItem.value.topic ?? null,
    );
  }

  const score = computed(() => {
    const correct = results.value.filter((r) => r === true).length;
    const wrong = results.value.filter((r) => r === false).length;
    return Math.max(0, correct - wrong / 3);
  });

  async function handleNext() {
    if (isLastItem.value) {
      const summary = getSessionSummaryFn?.();
      await submitSession?.();
      await grantQuizReward?.(score.value, totalItems.value);
      try {
        await gameSvc.createGame({
          gameName: "Quiz",
          score: score.value,
          duration: summary?.elapsedMin ?? 0,
          result: rankLabelRef?.value?.toLowerCase() ?? "suspenso",
        });
      } catch (_) {
        /* no bloquear si falla la red */
      }

      try {
        const res = await categorySvc.getAll();
        weakCategoriesAfterQuiz.value = calcWeakCategories(res.data ?? [], 5);
      } catch (_) {
        weakCategoriesAfterQuiz.value = [];
      }
    }

    next(() => {
      selectedAnswer.value = null;
      answered.value = false;
    });
  }

  function handleRestart() {
    resetSession?.();
    weakCategoriesAfterQuiz.value = [];
    restart(() => {
      selectedAnswer.value = null;
      answered.value = false;
      results.value = new Array(totalItems.value).fill(null);
    });
  }

  function goToAdaptiveQuizFromResults() {
    const r = routerParam ?? useRouter();
    r.push({
      path: "/in-game-view/",
      query: { game: "Quiz", adaptive: "true" },
    });
  }

  return {
    selectedAnswer,
    answered,
    results,
    initResults,
    selectAnswer,
    handleNext,
    handleRestart,
    goToAdaptiveQuizFromResults,
    weakCategoriesAfterQuiz,
    score,
  };
}
