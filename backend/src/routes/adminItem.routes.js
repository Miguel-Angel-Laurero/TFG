const router     = require('express').Router()
const controller = require('../controllers/adminItem.controller')
const { authMiddleware } = require('../middlewares/auth.middleware')

// multer fields: acepta ambos campos de imagen opcionales
const uploadFields = controller.upload.fields([
  { name: 'img',          maxCount: 1 },
  { name: 'equipped_img', maxCount: 1 },
])

router.get('/',             authMiddleware, controller.getItems)
router.get('/categories',   authMiddleware, controller.getCategories)
router.get('/:id',          authMiddleware, controller.getItemById)
router.post('/',            authMiddleware, uploadFields, controller.createItem)
router.put('/:id',          authMiddleware, uploadFields, controller.updateItem)
router.delete('/:id',       authMiddleware, controller.deleteItem)

module.exports = router