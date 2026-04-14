// composables/useQuizHistory.js
// ─────────────────────────────────────────────────────────────────────────────
// Historial de partidas Quiz y control del desbloqueo del sistema adaptativo.
//
// Desbloqueo adaptativo:
//   - El botón se activa cuando el usuario lleva ≥ 3 partidas desde la última
//     vez que lo usó (o desde el inicio si nunca lo ha usado).
//   - Al pulsarlo se llama markAdaptiveUsed(), que guarda la base actual en
//     localStorage. El contador vuelve a 0.
// ─────────────────────────────────────────────────────────────────────────────
import { ref, computed } from "vue";
import { gameService } from "@/api/game.service";

const ADAPTIVE_BASE_KEY = "ludoscript_adaptive_base_count";
const ADAPTIVE_THRESHOLD = 3;

// ── Helpers de fecha relativa ────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 1) return "ahora mismo";
  if (mins < 60) return `hace ${mins} min`;
  if (hours < 24) return `hace ${hours} h`;
  if (days < 7) return `hace ${days} día${days > 1 ? "s" : ""}`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `hace ${weeks} semana${weeks > 1 ? "s" : ""}`;
  const months = Math.floor(days / 30);
  return `hace ${months} mes${months > 1 ? "es" : ""}`;
}

export function useQuizHistory() {
  const quizHistory = ref([]);
  const historyLoading = ref(false);

  // ── Base persitida ───────────────────────────────────────────────────────
  function getBase() {
    return parseInt(localStorage.getItem(ADAPTIVE_BASE_KEY) ?? "0", 10);
  }

  // ── Contadores ───────────────────────────────────────────────────────────
  const quizCount = computed(() => quizHistory.value.length);

  const gamesSinceLastAdaptive = computed(() => quizCount.value - getBase());

  const canUseAdaptive = computed(
    () => gamesSinceLastAdaptive.value >= ADAPTIVE_THRESHOLD,
  );

  const remainingGames = computed(() =>
    Math.max(0, ADAPTIVE_THRESHOLD - gamesSinceLastAdaptive.value),
  );

  // ── Carga del historial ──────────────────────────────────────────────────
  async function loadHistory() {
    historyLoading.value = true;
    try {
      const res = await gameService.getMine();
      quizHistory.value = (res.data ?? [])
        .filter((g) => g.gameName === "Quiz")
        .sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt));
    } catch (_) {
      quizHistory.value = [];
    } finally {
      historyLoading.value = false;
    }
  }

  // ── Marcar uso del adaptativo (resetea contador) ──────────────────────────
  function markAdaptiveUsed() {
    localStorage.setItem(ADAPTIVE_BASE_KEY, String(quizCount.value));
  }

  return {
    quizHistory,
    quizCount,
    canUseAdaptive,
    remainingGames,
    gamesSinceLastAdaptive,
    historyLoading,
    loadHistory,
    markAdaptiveUsed,
    timeAgo,
  };
}
