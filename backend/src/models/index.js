const sequelize = require("../../config/database");
const User = require("./User.model");
const Game = require("./Game.model");
const UserData = require("./UserData.model");

// ── Asociaciones ────────────────────────────────────────────────────────────
User.hasMany(Game, { foreignKey: "userId", as: "games", onDelete: "CASCADE" });
Game.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasOne(UserData, { foreignKey: "user_id", as: "userData" }); 
UserData.belongsTo(User, { foreignKey: "user_id", as: "user" });

module.exports = { sequelize, User, Game, UserData };
