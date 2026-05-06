import { computed, ref, onMounted } from "vue";
import { sessionService } from "@/api/session.service";
import { userScopedStorageKey } from "@/utils/storageKeys";

// ── Constantes ────────────────────────────────────────────────────
const LS_WEEKLY = "ludoscript_weeklySessions";
const TWO_WEEKS_DAYS = 14;
const HISTORY_MS = TWO_WEEKS_DAYS * 24 * 60 * 60 * 1000;

// ── Utilidades ────────────────────────────────────────────────────
const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const toDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const getAccuracy = (correct, total) =>
  total > 0 ? Math.round((correct / total) * 100) : null;

const fmt = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
});

// ── Composable ────────────────────────────────────────────────────
export function useFortnightData() {
  const recentSessions = ref([]);

  onMounted(async () => {
    try {
      const res = await sessionService.getRecentSessions(14);
      recentSessions.value = res.data ?? [];
      console.log(
        "primera sesión:",
        JSON.stringify(recentSessions.value[0], null, 2),
      );
    } catch (_) {
      try {
        const cutoff = Date.now() - HISTORY_MS;
        recentSessions.value = JSON.parse(
          localStorage.getItem(userScopedStorageKey(LS_WEEKLY)) || "[]",
        ).filter((s) => s.timestamp >= cutoff);
      } catch {
        recentSessions.value = [];
        console.log(
          "primera sesión:",
          JSON.stringify(recentSessions.value[0], null, 2),
        );
      }
    }
  });

  // ── Sesiones agrupadas por fecha ──────────────────────────────
  const sessionsByDate = computed(() => {
    const agg = {};
    for (const session of recentSessions.value) {
      const key = toDateKey(
        startOfDay(Number(new Date(Number(session.timestamp)))),
      );
      if (!agg[key]) agg[key] = { correct: 0, total: 0, sessions: 0 };
      agg[key].sessions++;
      for (const stat of Object.values(session.stats ?? {})) {
        agg[key].correct += stat.correct ?? 0;
        agg[key].total += stat.total ?? 0;
      }
    }
    return agg;
  });

  // ── Rango de fechas ───────────────────────────────────────────
  const rangeEnd = computed(() => startOfDay(new Date()));

  const rangeStart = computed(() => {
    if (recentSessions.value.length === 0) {
      const d = new Date(rangeEnd.value);
      d.setDate(d.getDate() - (TWO_WEEKS_DAYS - 1));
      return d;
    }
    const oldest = Math.min(...recentSessions.value.map((s) => s.timestamp));
    return startOfDay(new Date(oldest));
  });

  const rangeDays = computed(() => {
    const days = [];
    const current = new Date(rangeStart.value);
    const end = new Date(rangeEnd.value);
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  });

  // ── Totales ───────────────────────────────────────────────────
  const totals = computed(() =>
    Object.values(sessionsByDate.value).reduce(
      (acc, day) => {
        acc.correct += day.correct;
        acc.total += day.total;
        acc.sessions += day.sessions;
        if (day.total > 0) acc.activeDays++;
        return acc;
      },
      { correct: 0, total: 0, sessions: 0, activeDays: 0 },
    ),
  );

  const bestDay = computed(
    () =>
      rangeDays.value
        .map((date) => {
          const data = sessionsByDate.value[toDateKey(date)];
          if (!data?.total) return null;
          return {
            ...data,
            percent: getAccuracy(data.correct, data.total),
            date,
          };
        })
        .filter(Boolean)
        .sort((a, b) => b.percent - a.percent || b.total - a.total)
        .at(0) ?? null,
  );

  // ── Métricas resumen ──────────────────────────────────────────
  const summaryMetrics = computed(() => {
    const accuracy = getAccuracy(totals.value.correct, totals.value.total);
    return [
      {
        label: "Precisión media",
        icon: "pi-chart-bar",
        value: accuracy !== null ? `${accuracy}%` : "-",
        helper: `${totals.value.correct}/${totals.value.total} respuestas correctas`,
      },
      {
        label: "Mejor día",
        icon: "pi-star",
        value: bestDay.value ? `${bestDay.value.percent}%` : "-",
        helper: bestDay.value
          ? `${fmt.format(bestDay.value.date)} · ${bestDay.value.correct}/${bestDay.value.total}`
          : "sin datos suficientes",
      },
    ];
  });

  // ── Estado de rendimiento ─────────────────────────────────────
  const performanceStatus = computed(() => {
    const accuracy = getAccuracy(totals.value.correct, totals.value.total);
    if (accuracy === null) return null;

    if (accuracy >= 90)
      return {
        text: "¡Rendimiento Maestro!",
        subtext: "Nivel excepcional",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
      };
    if (accuracy >= 75)
      return {
        text: "Progresando adecuadamente",
        subtext: "Buen ritmo de aprendizaje",
        color: "text-cyan-400",
        bg: "bg-cyan-500/10",
        border: "border-cyan-500/20",
      };
    if (accuracy >= 50)
      return {
        text: "Rendimiento estable",
        subtext: "Sigue practicando para mejorar",
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
      };
    return {
      text: "Necesitas más práctica",
      subtext: "No te rindas, la clave es la constancia",
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
    };
  });

  const hasActivity = computed(() =>
    Object.values(sessionsByDate.value).some((e) => e.total > 0),
  );

  return {
    // datos del calendario
    sessionsByDate,
    rangeStart,
    rangeEnd,
    rangeDays,
    // métricas
    summaryMetrics,
    performanceStatus,
    hasActivity,
    totals,
    bestDay,
  };
}
