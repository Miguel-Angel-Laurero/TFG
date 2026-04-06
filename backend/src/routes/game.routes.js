const router = require("express").Router();
const gameController = require("../controllers/game.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { CategoryStat } = require("../models");
const {
  generateAdaptiveReinforcement,
} = require("../controllers/gemini-service");

// GET /api/games  (público: ranking general)
router.get("/", gameController.getAll);

// Rutas protegidas
router.use(authMiddleware);

// GET /api/games/my  (partidas del usuario autenticado)
router.get("/my", gameController.getMine);

// GET /api/games/weekly  (actividad semanal del usuario autenticado)
router.get("/weekly", gameController.getWeekly);

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
      return res
        .status(404)
        .json({
          message:
            "Todavía no hay estadísticas de categorías para este usuario.",
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
