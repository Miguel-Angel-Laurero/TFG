const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");

// Definimos el endpoint GET
router.get("/", categoryController.getAllCategories);

module.exports = router;
