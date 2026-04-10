const router = require("express").Router();
const { getShopItems, buyItem } = require("../controllers/shop.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", authMiddleware, getShopItems);
router.post("/buy/:itemId", authMiddleware, buyItem);

module.exports = router;