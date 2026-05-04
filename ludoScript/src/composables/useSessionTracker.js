// composables/useSessionTracker.js
// ─────────────────────────────────────────────────────────────────────────────
// Tracker de sesión global. Usa sessionStorage para que los datos se reseteen
// automáticamente al cerrar la pestaña.
//
// API pública:
//   recordAnswer(isCorrect)   → registra una respuesta; inicia el timer si es la primera
//   getSessionSummary()       → devuelve { accuracy, elapsedMin, totalQuestions, maxStreak }
//                                o null si el usuario no ha contestado nada todavía
// ─────────────────────────────────────────────────────────────────────────────

const SS_KEY = "ludoscript_session";

function _read() {
  try {
    return JSON.parse(sessionStorage.getItem(SS_KEY) || "null");
  } catch (_) {
    return null;
  }
}

function _write(data) {
  try {
    sessionStorage.setItem(SS_KEY, JSON.stringify(data));
  } catch (_) {
    /* quota exceeded — silently ignore */
  }
}

function _initial() {
  return {
    startTime: null,
    totalQuestions: 0,
    totalCorrect: 0,
    maxStreak: 0,
    currentStreak: 0,
  };
}

/**
 * Registra una respuesta en el tracker de sesión.
 * Inicia el contador de tiempo en la primera llamada de la pestaña.
 * @param {boolean} isCorrect
 */
export function recordAnswer(isCorrect) {
  const data = _read() ?? _initial();
  if (data.startTime === null) data.startTime = Date.now();
  data.totalQuestions++;
  if (isCorrect) {
    data.totalCorrect++;
    data.currentStreak++;
    if (data.currentStreak > data.maxStreak)
      data.maxStreak = data.currentStreak;
  } else {
    data.currentStreak = 0;
  }
  _write(data);
}

/**
 * Devuelve un resumen legible de la sesión actual.
 * @returns {{ accuracy: number, elapsedMin: number, totalQuestions: number, maxStreak: number } | null}
 */
export function getSessionSummary() {
  const data = _read();
  if (!data || data.totalQuestions === 0) return null;
  const elapsedMin = data.startTime
    ? Math.floor((Date.now() - data.startTime) / 60000)
    : 0;
  return {
    accuracy: Math.round((data.totalCorrect / data.totalQuestions) * 100),
    elapsedMin,
    totalQuestions: data.totalQuestions,
    maxStreak: data.maxStreak,
  };
}

export function resetSessionTracker() {
  try {
    sessionStorage.removeItem(SS_KEY);
  } catch (_) {
    /* ignore */
  }
}
