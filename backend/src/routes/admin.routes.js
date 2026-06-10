const router = require("express").Router();
const { authMiddleware, isAdmin } = require("../middlewares/auth.middleware");
const adminController = require("../controllers/admin.controller");

// Todos los endpoints de admin requieren token y ser administrador
router.use(authMiddleware);
router.use(isAdmin);

router.get("/users", adminController.getUsers);
router.put("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);
router.post('/users', adminController.createUser)
router.get("/gemini-usage", adminController.getGeminiUsage);

module.exports = router;
