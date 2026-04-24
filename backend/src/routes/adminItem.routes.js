const router  = require("express").Router();
const multer  = require("multer");
const upload  = multer(); // memoria, sin guardar fichero (tú ya gestionas las imágenes aparte)
const {
  getItems, getCategories, getItemById,
  createItem, updateItem, deleteItem,
} = require("../controllers/adminItem.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

router.get("/categories", authMiddleware, getCategories);
router.get("/",           authMiddleware, getItems);
router.get("/:id",        authMiddleware, getItemById);
router.post("/",          authMiddleware, upload.fields([{ name: "img" }, { name: "equipped_img" }]), createItem);
router.put("/:id",        authMiddleware, upload.fields([{ name: "img" }, { name: "equipped_img" }]), updateItem);
router.delete("/:id",     authMiddleware, deleteItem);

module.exports = router;