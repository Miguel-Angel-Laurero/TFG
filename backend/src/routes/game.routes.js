const router = require('express').Router();
const gameController = require('../controllers/game.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// GET /api/games  (público: ranking general)
router.get('/', gameController.getAll);

// Rutas protegidas
router.use(authMiddleware);

// GET /api/games/my  (partidas del usuario autenticado)
router.get('/my', gameController.getMine);

// GET /api/games/:id
router.get('/:id', gameController.getById);

// POST /api/games
router.post('/', gameController.create);

// PUT /api/games/:id
router.put('/:id', gameController.update);

// DELETE /api/games/:id
router.delete('/:id', gameController.remove);

module.exports = router;
