// composables/useCategoryStats.js
// ─────────────────────────────────────────────────────────────────────────────
// Responsabilidad única: rastrear aciertos/errores por categoría temática
// durante una sesión de Quiz y enviarlos al backend al finalizar.
//
// Uso en Quiz.vue:
//   const { trackAnswer, submitSession, resetSession } = useCategoryStats()
//   trackAnswer(currentItem.value.category, isCorrect, currentItem.value.id, currentItem.value.difficulty)
//   await submitSession()
//   resetSession()
// ─────────────────────────────────────────────────────────────────────────────
import { ref } from "vue";
import { categoryStatsService } from "@/api/categoryStats.service";
import { recordAnswer } from "@/composables/useSessionTracker";

const LS_LAST_SESSION = "ludoscript_lastSession";
const LS_WEEKLY = "ludoscript_weeklySessions";
const SESSION_HISTORY_MS = 14 * 24 * 60 * 60 * 1000;

export function useCategoryStats() {
  // { [category]: { correct, total, failedIds: number[], byDifficulty: { [1|2|3]: { correct, total } } } }
  const sessionStats = ref({});
  const currentPdfId = ref(null);

  function setPdfSource(id) {
    currentPdfId.value = id ? String(id) : null;
  }

  function trackAnswer(
    category,
    isCorrect,
    questionId = null,
    difficulty = null,
  ) {
    if (!category) return;
    if (!sessionStats.value[category]) {
      sessionStats.value[category] = {
        correct: 0,
        total: 0,
        failedIds: [],
        byDifficulty: {},
      };
    }
    const catStat = sessionStats.value[category];
    catStat.total++;
    if (isCorrect) {
      catStat.correct++;
    } else if (questionId !== null) {
      catStat.failedIds.push(questionId);
    }

    // Acumular por nivel de dificultad
    if (difficulty !== null && [1, 2, 3].includes(difficulty)) {
      if (!catStat.byDifficulty[difficulty]) {
        catStat.byDifficulty[difficulty] = { correct: 0, total: 0 };
      }
      catStat.byDifficulty[difficulty].total++;
      if (isCorrect) catStat.byDifficulty[difficulty].correct++;
    }

    recordAnswer(isCorrect);
  }

  async function submitSession() {
    const entries = Object.entries(sessionStats.value).map(
      ([category, { correct, total, byDifficulty }]) => {
        const entry = { category, correct, total };
        // Incluir desglose por dificultad si hubo intentos
        if (byDifficulty && Object.keys(byDifficulty).length > 0) {
          entry.difficultyBreakdown = byDifficulty;
        }
        return entry;
      },
    );
    if (entries.length === 0) return;

    // Persist last session for heatmap & review page
    const sessionData = {
      timestamp: Date.now(),
      pdfId: currentPdfId.value,
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
      const cutoff = Date.now() - SESSION_HISTORY_MS;
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
    currentPdfId.value = null;
  }

  return { sessionStats, trackAnswer, submitSession, resetSession, setPdfSource };
}
