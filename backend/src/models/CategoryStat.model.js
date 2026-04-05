const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

// Almacena los aciertos y el total de intentos de un usuario por categoría temática.
// La combinación (userId, category) es única: se acumula en cada sesión de quiz.
const CategoryStat = sequelize.define(
  "CategoryStat",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Users", key: "id" },
    },
    // Identificador de la categoría, p.ej. "tipos-coercion", "asincronia"
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    correct: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "category_stats",
    timestamps: false,
    indexes: [{ unique: true, fields: ["userId", "category"] }],
  },
);

module.exports = CategoryStat;
