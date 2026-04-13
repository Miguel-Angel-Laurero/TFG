const { ItemsUser, Item, ItemCategory } = require("../models");

// GET /api/users/:id/items
const getUserItems = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "admin" && req.user.id !== Number(id)) {
      return res.status(403).json({ message: "Acceso denegado" });
    }

       const raw = await ItemsUser.findAll({ where: { user_id: id } })
    console.log('raw items_user:', JSON.stringify(raw, null, 2))

    const items = await ItemsUser.findAll({
      where: { user_id: id },
      include: [
        {
          model: Item,
          as: "item",
          include: [{ model: ItemCategory, as: "category" }],
        },
      ],
    });

    res.json(items);
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/:id/items/:itemsUserId/equip
const equipItem = async (req, res, next) => {
  try {
    const { id, itemsUserId } = req.params;
    const { is_equipped } = req.body;

    if (req.user.role !== "admin" && req.user.id !== Number(id)) {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    const itemsUser = await ItemsUser.findOne({
      where: { id: itemsUserId, user_id: id },
    });

    if (!itemsUser) {
      return res.status(404).json({ message: "Item no encontrado" });
    }

    await itemsUser.update({ is_equipped });

    res.json(itemsUser);
  } catch (err) {
    next(err);
  }
};

module.exports = { getUserItems, equipItem };