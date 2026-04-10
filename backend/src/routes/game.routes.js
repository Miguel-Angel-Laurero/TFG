const router = require("express").Router();
const fs = require("fs");
const path = require("path");
const gameController = require("../controllers/game.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { CategoryStat } = require("../models");
const {
  generateAdaptiveReinforcement,
  generateAdaptiveQuizQuestions,
} = require("../controllers/gemini-service");

const STATIC_QUIZ_PATH = path.join(
  __dirname,
  "../../../ludoScript/public/quizQuestions.json",
);

let STATIC_QUIZ_BANK = [];
try {
  STATIC_QUIZ_BANK = JSON.parse(fs.readFileSync(STATIC_QUIZ_PATH, "utf-8"));
} catch (error) {
  console.error(
    "No se pudo cargar quizQuestions.json para el fallback adaptativo:",
    error.message,
  );
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildAdaptiveCounts(ranked, totalQuestions = 50) {
  if (!ranked.length) return [];

  const weights = ranked.map((entry) => Math.max(entry.errorRate, 0));
  const normalizedWeights = weights.every((weight) => weight === 0)
    ? ranked.map(() => 1)
    : weights;
  const totalWeight = normalizedWeights.reduce((sum, weight) => sum + weight, 0);
  const exactCounts = normalizedWeights.map(
    (weight) => (weight / totalWeight) * totalQuestions,
  );
  const counts = exactCounts.map((count) => Math.max(1, Math.floor(count)));

  let assigned = counts.reduce((sum, count) => sum + count, 0);
  while (assigned < totalQuestions) {
    let bestIdx = 0;
    let bestFraction = -Infinity;
    for (let i = 0; i < exactCounts.length; i += 1) {
      const fraction = exactCounts[i] - counts[i];
      if (fraction > bestFraction) {
        bestFraction = fraction;
        bestIdx = i;
      }
    }
    counts[bestIdx] += 1;
    assigned += 1;
  }

  while (assigned > totalQuestions) {
    const removable = counts
      .map((count, index) => ({ count, index }))
      .filter(({ count }) => count > 1)
      .sort((a, b) => b.count - a.count)[0];
    if (!removable) break;
    counts[removable.index] -= 1;
    assigned -= 1;
  }

  return ranked.map((entry, index) => ({
    category: entry.category,
    errorRate: entry.errorRate,
    count: counts[index],
  }));
}

function buildAdaptiveFallbackQuestions(categories, limit = 15) {
  const priority = new Map(
    categories.map((entry, index) => [entry.category, index]),
  );

  const prioritized = shuffle(STATIC_QUIZ_BANK).sort((a, b) => {
    const aRank = priority.has(a.category) ? priority.get(a.category) : Infinity;
    const bRank = priority.has(b.category) ? priority.get(b.category) : Infinity;
    return aRank - bRank;
  });

  return prioritized.slice(0, Math.min(limit, prioritized.length));
}

// GET /api/games  (público: ranking general)
router.get("/", gameController.getAll);

// Rutas protegidas
router.use(authMiddleware);

// GET /api/games/my  (partidas del usuario autenticado)
router.get("/my", gameController.getMine);

// GET /api/games/weekly  (actividad semanal del usuario autenticado)
router.get("/weekly", gameController.getWeekly);

// GET /api/games/adaptive-quiz
// Calcula las categorías más débiles del usuario (algorimo de pesos por tasa de error),
// genera 50 preguntas focalizadas con Gemini y devuelve el array junto a los metadatos
// de las categorías débiles para que el frontend muestre el badge visual.
// Prerequisito: al menos 1 categoría con total >= 5 respuestas. Si no, devuelve 204.
router.get("/adaptive-quiz", async (req, res, next) => {
  try {
    const stats = await CategoryStat.findAll({
      where: { userId: req.user.id },
      attributes: ["category", "correct", "total"],
    });

    // Solo se consideran categorías con suficiente historial (>=5 respuestas)
    const eligible = stats.filter((s) => s.total >= 5);
    if (!eligible.length) {
      return res.status(204).send();
    }

    // Calcula la tasa de error y ordena de mayor a menor
    const ranked = eligible
      .map((s) => ({
        category: s.category,
        errorRate: (s.total - s.correct) / s.total,
      }))
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, 3); // Máximo 3 categorías

    const categories = buildAdaptiveCounts(ranked, 50);
    let questions;
    let source = "gemini";

    try {
      questions = await generateAdaptiveQuizQuestions(categories);
    } catch (error) {
      source = "local-fallback";
      questions = buildAdaptiveFallbackQuestions(categories, 15);
      console.warn(
        "[adaptive-quiz] Gemini no disponible, usando fallback local:",
        error.message,
      );
    }

    res.json({
      source,
      questions,
      weakCategories: categories.map(({ category, errorRate, count }) => ({
        category,
        errorRate,
        count,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/games/:id
router.get("/:id", gameController.getById);

// POST /api/games
router.post("/", gameController.create);

// PUT /api/games/:id
router.put("/:id", gameController.update);

// DELETE /api/games/:id
router.delete("/:id", gameController.remove);

// POST /api/games/reinforce
// Encuentra el tag con más fallos del usuario (total − correct) y devuelve
// una explicación pedagógica y una pregunta de refuerzo generadas por Gemini.
router.post("/reinforce", async (req, res, next) => {
  try {
    const stats = await CategoryStat.findAll({
      where: { userId: req.user.id },
      attributes: ["category", "correct", "total"],
    });

    if (!stats.length) {
      return res.status(404).json({
        message: "Todavía no hay estadísticas de categorías para este usuario.",
      });
    }

    // El tag con más fallos es aquel con mayor diferencia (total − correct)
    const worst = stats.reduce((prev, curr) =>
      curr.total - curr.correct > prev.total - prev.correct ? curr : prev,
    );

    const reinforcement = await generateAdaptiveReinforcement(worst.category);

    res.json({
      tag: worst.category,
      failures: worst.total - worst.correct,
      ...reinforcement,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
