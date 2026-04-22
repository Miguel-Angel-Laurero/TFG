const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const controller = require("../controllers/session.controller");

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// POST /api/sessions — guarda una sesión de quiz
router.post("/", controller.saveSession);

// GET /api/sessions/last — última sesión del usuario
router.get("/last", controller.getLastSession);

// GET /api/sessions/recent?limit=14 — sesiones más recientes
router.get("/recent", controller.getRecentSessions);

module.exports = router;
