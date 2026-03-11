const sequelize = require("../../config/database");
const User = require("./User.model");
const Game = require("./Game.model");

// ── Asociaciones ────────────────────────────────────────────────────────────
User.hasMany(Game, { foreignKey: "userId", as: "games", onDelete: "CASCADE" });
Game.belongsTo(User, { foreignKey: "userId", as: "user" });

module.exports = { sequelize, User, Game };
