const multer              = require('multer')
const { Op }              = require('sequelize')
const Item                = require('../models/Item.model')
const ItemCategory        = require('../models/ItemCategory.model')
const { uploadItemImage, supabase } = require('../utils/supabaseStorage')

// multer en memoria
const upload = multer({ storage: multer.memoryStorage() })

// GET /api/items?page=1&limit=20&search=
async function getItems(req, res) {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1)
    const limit  = Math.max(1, parseInt(req.query.limit) || 20)
    const search = req.query.search?.trim() || ''
    const offset = (page - 1) * limit

    const where = search ? { name: { [Op.like]: `%${search}%` } } : {}

    const { count, rows } = await Item.findAndCountAll({
      where, limit, offset, order: [['id', 'ASC']],
    })

    res.json({
      items:      rows,
      page,
      totalPages: Math.ceil(count / limit),
      total:      count,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error al obtener items' })
  }
}

// GET /api/items/categories
async function getCategories(req, res) {
  try {
    const categories = await ItemCategory.findAll({ order: [['id', 'ASC']] })
    res.json(categories)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error al obtener categorias' })
  }
}

// GET /api/items/:id
async function getItemById(req, res) {
  try {
    const item = await Item.findByPk(req.params.id)
    if (!item) return res.status(404).json({ message: 'Item no encontrado' })
    res.json(item)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error al obtener el item' })
  }
}

// POST /api/items
async function createItem(req, res) {
  try {
    const { name, categoryId, price } = req.body
    if (!name || price === undefined || price === '') {
      return res.status(400).json({ message: 'name y price son obligatorios' })
    }

    const category     = categoryId ? await ItemCategory.findByPk(categoryId) : null
    const categoryName = category?.name?.toLowerCase().replace(/\s+/g, '-') || 'sin-categoria'

    let imgUrl         = null
    let equippedImgUrl = null

    if (req.files?.img?.[0]) {
      const f = req.files.img[0]
      imgUrl = await uploadItemImage(f.buffer, f.originalname, f.mimetype, categoryName, false)
    }
    if (req.files?.equipped_img?.[0]) {
      const f = req.files.equipped_img[0]
      equippedImgUrl = await uploadItemImage(f.buffer, f.originalname, f.mimetype, categoryName, true)
    }

    const item = await Item.create({
      name,
      type_id:      categoryId || null,
      price:        Number(price),
      img:          imgUrl,
      equipped_img: equippedImgUrl,
    })

    res.status(201).json({ message: 'Item creado', item })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error al crear el item' })
  }
}

// PUT /api/items/:id
async function updateItem(req, res) {
  try {
    const item = await Item.findByPk(req.params.id)
    if (!item) return res.status(404).json({ message: 'Item no encontrado' })

    const { name, categoryId, price } = req.body

    const category     = categoryId ? await ItemCategory.findByPk(categoryId) : null
    const categoryName = category?.name?.toLowerCase().replace(/\s+/g, '-') || 'sin-categoria'

    let imgUrl         = item.img
    let equippedImgUrl = item.equipped_img

    if (req.files?.img?.[0]) {
      const f = req.files.img[0]
      imgUrl = await uploadItemImage(f.buffer, f.originalname, f.mimetype, categoryName, false)
    }
    if (req.files?.equipped_img?.[0]) {
      const f = req.files.equipped_img[0]
      equippedImgUrl = await uploadItemImage(f.buffer, f.originalname, f.mimetype, categoryName, true)
    }

    await item.update({
      name:         name       ?? item.name,
      type_id:      categoryId ?? item.type_id,
      price:        price !== undefined ? Number(price) : item.price,
      img:          imgUrl,
      equipped_img: equippedImgUrl,
    })

    res.json({ message: 'Item actualizado', item })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error al actualizar el item' })
  }
}
function extractStoragePath(publicUrl) {
    if (!publicUrl) return null
    // La URL tiene formato: .../storage/v1/object/public/images/items/...
    const marker = '/object/public/images/'
    const idx = publicUrl.indexOf(marker)
    if (idx === -1) return null
    return publicUrl.substring(idx + marker.length)
}
// DELETE /api/items/:id
async function deleteItem(req, res) {
    try {
        const item = await Item.findByPk(req.params.id)
        if (!item) return res.status(404).json({ message: 'Item no encontrado' })

        // Recoger las rutas de las imágenes antes de borrar el registro
        const pathsToDelete = [
            extractStoragePath(item.img),
            extractStoragePath(item.equipped_img),
        ].filter(Boolean) // elimina los null

        // Borrar el registro de la BD
        await item.destroy()

        // Borrar las imágenes del Storage (si las hay)
        if (pathsToDelete.length > 0) {
            const { error } = await supabase.storage
                .from('images')
                .remove(pathsToDelete)

            if (error) {
                // No lanzamos error al cliente, el item ya se borró
                console.error('Error al borrar imágenes del Storage:', error.message)
            }
        }

        res.json({ message: 'Item eliminado' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error al eliminar el item' })
    }
}

module.exports = { upload, getItems, getCategories, getItemById, createItem, updateItem, deleteItem }