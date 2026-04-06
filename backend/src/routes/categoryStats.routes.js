const router = require("express").Router();
const controller = require("../controllers/categoryStats.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /api/category-stats — estadísticas del usuario autenticado
router.get("/", controller.getMine);

// POST /api/category-stats/batch — envía los resultados de una sesión de quiz
router.post("/batch", controller.submitBatch);

// POST /api/category-stats/error — registra un fallo en una categoría (tag)
router.post("/error", controller.trackError);

module.exports = router;
