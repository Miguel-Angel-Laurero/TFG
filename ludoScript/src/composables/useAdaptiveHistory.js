// composables/useAdaptiveHistory.js
// ─────────────────────────────────────────────────────────────────────────────
// Historial de partidas y control del desbloqueo del sistema adaptativo,
// independiente por tipo de juego ('Quiz' | 'FlashCards').
//
// Desbloqueo:
//   - Activo cuando el usuario acumula ≥ 3 partidas desde la última vez
//     que pulsó el botón (o desde el inicio si nunca lo ha usado).
//   - Al pulsarlo, markAdaptiveUsed() guarda la base en localStorage y
//     resetea el contador de ese juego.
// ─────────────────────────────────────────────────────────────────────────────
import { ref, computed } from "vue";
import { gameService } from "@/api/game.service";

const ADAPTIVE_THRESHOLD = 3;

// ── Helpers de fecha relativa ────────────────────────────────────────────────
export function timeAgo(dateStr) {
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

/**
 * @param {'Quiz' | 'FlashCards'} gameType
 */
export function useAdaptiveHistory(gameType) {
  const baseKey = `ludoscript_adaptive_base_${gameType}`;

  const history = ref([]);
  const historyLoading = ref(false);

  // ── Base persistida ──────────────────────────────────────────────────────
  function getBase() {
    return parseInt(localStorage.getItem(baseKey) ?? "0", 10);
  }

  // ── Contadores (reactivos cuando cambia history) ──────────────────────────
  const sessionCount = computed(() => history.value.length);

  const gamesSinceLastAdaptive = computed(() => sessionCount.value - getBase());

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
      history.value = (res.data ?? [])
        .filter((g) => g.gameName === gameType)
        .sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt));
    } catch (_) {
      history.value = [];
    } finally {
      historyLoading.value = false;
    }
  }

  // ── Resetear contador al usar el adaptativo ───────────────────────────────
  function markAdaptiveUsed() {
    localStorage.setItem(baseKey, String(sessionCount.value));
  }

  return {
    history,
    sessionCount,
    canUseAdaptive,
    remainingGames,
    gamesSinceLastAdaptive,
    historyLoading,
    loadHistory,
    markAdaptiveUsed,
    timeAgo,
  };
}
