const router = require("express").Router();
const userController = require("../controllers/user.controller");
const userItemsController = require("../controllers/userItems.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

// Todas las rutas de usuario requieren autenticación
router.use(authMiddleware);

// GET /api/users
router.get("/", userController.getAll);

// GET /api/users/:id
router.get("/:id", userController.getById);

// PUT /api/users/:id
router.put("/:id", userController.update);

// DELETE /api/users/:id
router.delete("/:id", userController.remove);

// GET /api/users/:id/items  →  solo el propio usuario o admin
router.get("/:id/items", userItemsController.getUserItems);

// GET /api/users/:id/equipped  →  cualquier usuario autenticado (para el lobby)
router.get("/:id/equipped", userItemsController.getEquippedItems);

// PUT /api/users/:id/items/:itemsUserId/equip
router.put("/:id/items/:itemsUserId/equip", userItemsController.equipItem);

module.exports = router;
