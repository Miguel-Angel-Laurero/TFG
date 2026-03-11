const { Sequelize } = require("sequelize");
const path = require("path");

// SQLite para desarrollo/hosting sin necesidad de servidor de BD externo.
// Cambia a MySQL/PostgreSQL para producción real actualizando las variables de entorno.
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.resolve(__dirname, "../db/ludoscript.db"),
  logging: process.env.NODE_ENV === "development" ? console.log : false,
});

module.exports = sequelize;
