const { ItemCategory } = require("../models/index"); // Importamos desde tu archivo de asociaciones

/**
 * Obtiene todas las categorías de ítems desde la base de datos
 */
exports.getAllCategories = async (req, res) => {
  try {
    // Utilizamos el modelo ItemCategory definido con Sequelize
    const categories = await ItemCategory.findAll({
      attributes: ["id", "name"], // Solo traemos los campos necesarios definidos en el modelo
      order: [["name", "ASC"]],   // Ordenamos alfabéticamente para mejor UX en el MultiSelect
    });

    // Validamos si existen categorías
    if (!categories || categories.length === 0) {
      return res.status(404).json({
        message: "No se encontraron categorías disponibles.",
      });
    }

    // Devolvemos la lista al frontend
    return res.status(200).json(categories);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return res.status(500).json({
      message: "Error interno del servidor al recuperar las categorías.",
      error: error.message,
    });
  }
};