const router = require("express").Router();
const gameController = require("../controllers/game.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { CategoryStat } = require("../models");
const {
  generateAdaptiveReinforcement,
  generateAdaptiveQuizQuestions,
} = require("../controllers/gemini-service");

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

    // Distribuye 50 preguntas proporcionales a la tasa de error
    const totalRate = ranked.reduce((sum, c) => sum + c.errorRate, 0);
    let remaining = 50;
    const categories = ranked.map((c, idx) => {
      const isLast = idx === ranked.length - 1;
      const count = isLast
        ? remaining
        : Math.max(1, Math.round((c.errorRate / totalRate) * 50));
      remaining -= isLast ? 0 : count;
      return { category: c.category, count, errorRate: c.errorRate };
    });

    const questions = await generateAdaptiveQuizQuestions(categories);

    res.json({
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
