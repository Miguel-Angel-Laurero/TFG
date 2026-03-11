const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { validateRegister, validateLogin } = require('../utils/validators');
const validate = require('../middlewares/validate.middleware');
const authMiddleware = require('../middlewares/auth.middleware');

// POST /api/auth/register
router.post('/register', validateRegister, validate, authController.register);

// POST /api/auth/login
router.post('/login', validateLogin, validate, authController.login);

// GET /api/auth/me  (requiere token)
router.get('/me', authMiddleware, authController.me);

module.exports = router;
