const router = require("express").Router();

router.use("/auth", require("./auth.routes"));
router.use("/users", require("./user.routes"));
router.use("/games", require("./game.routes"));
router.use("/rewards", require("./rewards.routes"));
router.use("/upload", require("./upload.routes"));
router.use("/shop", require("./shop.routes"));
router.use("/categories", require("./category.routes"));
router.use("/activities", require("./activities.routes"));
// Rutas para la gestión de PDFs subidos por los usuarios
router.use("/pdfs", require("./pdf.routes"));
// Estadísticas por categoría temática del Quiz
router.use("/category-stats", require("./categoryStats.routes"));
// Sistema de clases (grupos)
router.use("/groups", require("./group.routes"));
// Sesiones de quiz del usuario
router.use("/sessions", require("./session.routes"));

module.exports = router;
