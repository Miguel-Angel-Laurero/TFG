// composables/useCategoryStats.js
// ─────────────────────────────────────────────────────────────────────────────
// Responsabilidad única: rastrear aciertos/errores por categoría temática
// durante una sesión de Quiz y enviarlos al backend al finalizar.
//
// Uso en Quiz.vue:
//   const { trackAnswer, submitSession, resetSession } = useCategoryStats()
//   trackAnswer(currentItem.value.category, isCorrect, currentItem.value.id)
//   await submitSession()
//   resetSession()
// ─────────────────────────────────────────────────────────────────────────────
import { ref } from "vue";
import { categoryStatsService } from "@/api/categoryStats.service";
import { recordAnswer } from "@/composables/useSessionTracker";

const LS_LAST_SESSION = "ludoscript_lastSession";
const LS_WEEKLY = "ludoscript_weeklySessions";
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function useCategoryStats() {
  // { [category]: { correct, total, failedIds: number[] } }
  const sessionStats = ref({});

  function trackAnswer(category, isCorrect, questionId = null) {
    if (!category) return;
    if (!sessionStats.value[category]) {
      sessionStats.value[category] = { correct: 0, total: 0, failedIds: [] };
    }
    sessionStats.value[category].total++;
    if (isCorrect) {
      sessionStats.value[category].correct++;
    } else if (questionId !== null) {
      sessionStats.value[category].failedIds.push(questionId);
    }
    recordAnswer(isCorrect);
  }

  async function submitSession() {
    const entries = Object.entries(sessionStats.value).map(
      ([category, { correct, total }]) => ({ category, correct, total }),
    );
    if (entries.length === 0) return;

    // Persist last session for heatmap & review page
    const sessionData = {
      timestamp: Date.now(),
      stats: Object.fromEntries(
        Object.entries(sessionStats.value).map(([cat, s]) => [
          cat,
          { correct: s.correct, total: s.total, failedIds: [...s.failedIds] },
        ]),
      ),
    };
    try {
      localStorage.setItem(LS_LAST_SESSION, JSON.stringify(sessionData));
      const stored = JSON.parse(localStorage.getItem(LS_WEEKLY) || "[]");
      const cutoff = Date.now() - ONE_WEEK_MS;
      const pruned = stored.filter((s) => s.timestamp > cutoff);
      pruned.push(sessionData);
      localStorage.setItem(LS_WEEKLY, JSON.stringify(pruned));
    } catch (_) {
      /* storage quota exceeded – silently ignore */
    }

    try {
      await categoryStatsService.submitBatch(entries);
    } catch (err) {
      console.error(
        "[useCategoryStats] Error al enviar stats de categoría:",
        err,
      );
    }
  }

  function resetSession() {
    sessionStats.value = {};
  }

  return { sessionStats, trackAnswer, submitSession, resetSession };
}
