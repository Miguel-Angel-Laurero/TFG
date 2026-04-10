const Item = require("../models/Item.model");
const ItemsUser = require("../models/ItemsUser.model");
const UserData = require("../models/UserData.model");

// GET /shop — Items con flag de si ya están adquiridos
async function getShopItems(req, res) {
  try {
    const userId = req.user.id;

    const [items, userItems] = await Promise.all([
      Item.findAll(),
      ItemsUser.findAll({ where: { user_id: userId } }),
    ]);

    const ownedIds = new Set(userItems.map((ui) => Number(ui.item_id)));

    const result = items.map((item) => ({
      ...item.toJSON(),
      is_adquired: ownedIds.has(Number(item.id)),
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener los items" });
  }
}

// POST /shop/buy/:itemId — Compra un item
async function buyItem(req, res) {
  try {
    const userId = req.user.id;
    const itemId = Number(req.params.itemId);

    const item = await Item.findByPk(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item no encontrado" });
    }

    const alreadyOwned = await ItemsUser.findOne({
      where: { user_id: userId, item_id: itemId },
    });
    if (alreadyOwned) {
      return res.status(409).json({ message: "Ya tienes este item" });
    }

    const userData = await UserData.findOne({ where: { user_id: userId } });
    if (!userData) {
      return res.status(404).json({ message: "Datos del usuario no encontrados" });
    }
    if (userData.coins < item.price) {
      return res.status(400).json({ message: "Coins insuficientes" });
    }

    await Promise.all([
      userData.update({ coins: userData.coins - item.price }),
      ItemsUser.create({ user_id: userId, item_id: itemId, is_equipped: false }),
    ]);

    res.status(201).json({
      message: "Compra realizada con éxito",
      remainingCoins: userData.coins - item.price,
      item: item.toJSON(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al procesar la compra" });
  }
}

module.exports = { getShopItems, buyItem };