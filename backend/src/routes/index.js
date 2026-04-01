const router = require("express").Router();

router.use("/auth", require("./auth.routes"));
router.use("/users", require("./user.routes"));
router.use("/games", require("./game.routes"));
router.use("/rewards", require("./rewards.routes"));
router.use("/upload", require("./upload.routes"));
// Rutas para la gestión de PDFs subidos por los usuarios
router.use("/pdfs", require("./pdf.routes"));

module.exports = router;
