const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

// Almacena los aciertos y el total de intentos de un usuario por categoría temática.
// La combinación (userId, category) es única: se acumula en cada sesión de quiz.
//
// Campos de dificultad:
//   unlockedDifficulty — nivel máximo desbloqueado (1=Básico, 2=Intermedio, 3=Avanzado)
//   d1Correct / d1Total — aciertos/intentos acumulados en preguntas de dificultad 1
//   d2Correct / d2Total — ídem dificultad 2
//   d3Correct / d3Total — ídem dificultad 3
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
    // Nivel de dificultad desbloqueado: 1 = Básico, 2 = Intermedio, 3 = Avanzado
    unlockedDifficulty: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    // Estadísticas acumuladas por nivel de dificultad (para evaluar el umbral de desbloqueo)
    d1Correct: { type: DataTypes.INTEGER, defaultValue: 0 },
    d1Total: { type: DataTypes.INTEGER, defaultValue: 0 },
    d2Correct: { type: DataTypes.INTEGER, defaultValue: 0 },
    d2Total: { type: DataTypes.INTEGER, defaultValue: 0 },
    d3Correct: { type: DataTypes.INTEGER, defaultValue: 0 },
    d3Total: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    tableName: "category_stats",
    timestamps: false,
    indexes: [{ unique: true, fields: ["userId", "category"] }],
  },
);

module.exports = CategoryStat;
