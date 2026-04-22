const express = require("express");
const router = express.Router();
const activitiesController = require("../controllers/activities.controller");

// Definimos el endpoint GET
router.get("/", activitiesController);

module.exports = router;
