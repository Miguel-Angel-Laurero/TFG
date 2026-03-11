const router = require('express').Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Todas las rutas de usuario requieren autenticación
router.use(authMiddleware);

// GET /api/users
router.get('/', userController.getAll);

// GET /api/users/:id
router.get('/:id', userController.getById);

// PUT /api/users/:id
router.put('/:id', userController.update);

// DELETE /api/users/:id
router.delete('/:id', userController.remove);

module.exports = router;
