const sequelize = require("../../config/database");
const User = require("./User.model");
const Game = require("./Game.model");
const UserData = require("./UserData.model");
const ItemsUser = require("./ItemsUser.model");
const Item = require("./Item.model");
// Modelo para los PDFs subidos por usuarios y el contenido generado por Gemini
const UserPdf = require("./UserPdf.model");

// ── Asociaciones ────────────────────────────────────────────────────────────
User.hasMany(Game, { foreignKey: "userId", as: "games", onDelete: "CASCADE" });
Game.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasOne(UserData, { foreignKey: "user_id", as: "userData" });
UserData.belongsTo(User, { foreignKey: "user_id", as: "user" });

User.hasMany(ItemsUser, { foreignKey: "user_id", as: "items" });
ItemsUser.belongsTo(User, { foreignKey: "user_id", as: "user" });

Item.hasMany(ItemsUser, { foreignKey: "item_id", as: "owners" });
ItemsUser.belongsTo(Item, { foreignKey: "item_id", as: "item" });

// Un usuario puede tener muchos PDFs; al eliminar un usuario se eliminan sus PDFs
User.hasMany(UserPdf, {
  foreignKey: "userId",
  as: "pdfs",
  onDelete: "CASCADE",
});
UserPdf.belongsTo(User, { foreignKey: "userId", as: "user" });

module.exports = { sequelize, User, Game, UserData, ItemsUser, Item, UserPdf };
