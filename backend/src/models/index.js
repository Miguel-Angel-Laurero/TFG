const sequelize = require("../../config/database");
const User = require("./User.model");
const Game = require("./Game.model");
const UserData = require("./UserData.model");
const ItemsUser = require("./ItemsUser.model");
const Item = require("./Item.model");

// ── Asociaciones ────────────────────────────────────────────────────────────
User.hasMany(Game, { foreignKey: "userId", as: "games", onDelete: "CASCADE" });
Game.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasOne(UserData, { foreignKey: "user_id", as: "userData" }); 
UserData.belongsTo(User, { foreignKey: "user_id", as: "user" });

User.hasMany(ItemsUser, { foreignKey: "user_id", as: "items" });
ItemsUser.belongsTo(User, { foreignKey: "user_id", as: "user" });

Item.hasMany(ItemsUser, { foreignKey: "item_id", as: "owners" });
ItemsUser.belongsTo(Item, { foreignKey: "item_id", as: "item" });
module.exports = { sequelize, User, Game, UserData,ItemsUser,Item };
