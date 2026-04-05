// api/categoryStats.service.js
// ─────────────────────────────────────────────────────────────────────────────
// Acceso a los endpoints de estadísticas por categoría temática del Quiz.
// ─────────────────────────────────────────────────────────────────────────────
import api from "./axios";

export const categoryStatsService = {
  // GET /api/category-stats — devuelve los stats del usuario autenticado
  getAll: () => api.get("/category-stats"),

  // POST /api/category-stats/batch — envía los resultados de una sesión
  // @param {Array<{ category: string, correct: number, total: number }>} entries
  submitBatch: (entries) => api.post("/category-stats/batch", { entries }),
};
