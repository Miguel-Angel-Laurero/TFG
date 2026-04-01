const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

// ── Modelo UserPdf ────────────────────────────────────────────────────────────
// Representa un PDF subido por un usuario junto con el contenido de juego que
// Gemini generó a partir de él: preguntas de Quiz y tarjetas Flashcard.
//
// El archivo PDF original NO se almacena en la BD; solo se guarda el JSON
// generado, lo que evita saturar el storage y no requiere llamadas adicionales
// a la IA cada vez que el usuario quiera jugar con ese PDF.
// ─────────────────────────────────────────────────────────────────────────────
const UserPdf = sequelize.define("UserPdf", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  // Referencia al usuario propietario del PDF.
  // No se declara como FK aquí: Sequelize la gestiona a través de la
  // asociación hasMany/belongsTo definida en models/index.js.
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  // Nombre original del archivo tal como lo envió el cliente (ej. "tema3.pdf").
  // Solo se usa para mostrar en la interfaz; no tiene ningún uso funcional.
  originalName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },

  // Array de preguntas de Quiz generadas por Gemini.
  // Cada elemento tiene la misma forma que los objetos de /public/quizQuestions.json:
  //   { id, question, options: string[4], correct: number }
  quizQuestions: {
    type: DataTypes.JSON,
    allowNull: false,
  },

  // Array de tarjetas Flashcard generadas por Gemini.
  // Cada elemento tiene la misma forma que los objetos de /public/flashCards.json:
  //   { question, answer }
  flashCards: {
    type: DataTypes.JSON,
    allowNull: false,
  },
});

module.exports = UserPdf;
