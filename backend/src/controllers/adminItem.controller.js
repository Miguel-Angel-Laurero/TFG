const { Op } = require("sequelize");
const Item         = require("../models/Item.model");
const ItemCategory = require("../models/ItemCategory.model");

// GET /api/items?page=1&limit=20&search=
async function getItems(req, res) {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.max(1, parseInt(req.query.limit) || 20);
    const search = req.query.search?.trim() || "";
    const offset = (page - 1) * limit;

    const where = search
      ? { name: { [Op.like]: `%${search}%` } }
      : {};

    const { count, rows } = await Item.findAndCountAll({
      where,
      limit,
      offset,
      order: [["id", "ASC"]],
    });

    res.json({
      items:      rows,
      page,
      totalPages: Math.ceil(count / limit),
      total:      count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener items" });
  }
}

// GET /api/items/categories
async function getCategories(req, res) {
  try {
    const categories = await ItemCategory.findAll({ order: [["id", "ASC"]] });
    res.json(categories); // [{ id, name }, ...]
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener categorias" });
  }
}

// GET /api/items/:id
async function getItemById(req, res) {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Item no encontrado" });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener el item" });
  }
}

// POST /api/items
async function createItem(req, res) {
  try {
    const { name, categoryId, price, img, equipped_img } = req.body;  // ← categoryId
    if (!name || price === undefined || price === '') {
      return res.status(400).json({ message: "name y price son obligatorios" });
    }
    const item = await Item.create({
      name,
      type_id: categoryId || null,  // ← mapear al campo real del modelo
      price:   Number(price),       // ← FormData envía strings, forzar número
      img:     img || null,
      equipped_img: equipped_img || null,
    });
    res.status(201).json({ message: "Item creado", item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al crear el item" });
  }
}

// PUT /api/items/:id
async function updateItem(req, res) {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Item no encontrado" });

    const { name, categoryId, price, img, equipped_img } = req.body;
    await item.update({
      name,
      type_id:      categoryId || null,
      price:        price !== undefined ? Number(price) : item.price,
      img:          img          || item.img,
      equipped_img: equipped_img || item.equipped_img,
    });
    res.json({ message: "Item actualizado", item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al actualizar el item" });
  }
}

// DELETE /api/items/:id
async function deleteItem(req, res) {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Item no encontrado" });
    await item.destroy();
    res.json({ message: "Item eliminado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al eliminar el item" });
  }
}

module.exports = { getItems, getCategories, getItemById, createItem, updateItem, deleteItem };