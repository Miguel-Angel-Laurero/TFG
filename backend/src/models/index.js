const sequelize = require("../../config/database");
const User = require("./User.model");
const Game = require("./Game.model");
const UserData = require("./UserData.model");
const ItemsUser = require("./ItemsUser.model");
const Item = require("./Item.model");
const ItemCategory = require("./ItemCategory.model");
const UserPdf = require("./UserPdf.model");
const CategoryStat = require("./CategoryStat.model");
const Activities = require("./Activities.model");
const Group = require("./Group.model");
const GroupMember = require("./GroupMember.model");
const UserSession = require("./UserSession.model");
const GeminiUsageLog = require("./GeminiUsageLog.model");

// ── Asociaciones ────────────────────────────────────────────────────────────
User.hasMany(Game, { foreignKey: "userId", as: "games", onDelete: "CASCADE" });
Game.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasOne(UserData, { foreignKey: "user_id", as: "userData" });
UserData.belongsTo(User, { foreignKey: "user_id", as: "user" });

User.hasMany(ItemsUser, { foreignKey: "user_id", as: "items" });
ItemsUser.belongsTo(User, { foreignKey: "user_id", as: "user" });

Item.hasMany(ItemsUser, { foreignKey: "item_id", as: "owners" });
ItemsUser.belongsTo(Item, { foreignKey: "item_id", as: "item" });

// Item pertenece a una categoría
ItemCategory.hasMany(Item, { foreignKey: "type_id", as: "items" });
Item.belongsTo(ItemCategory, { foreignKey: "type_id", as: "category" });

User.hasMany(UserPdf, {
  foreignKey: "userId",
  as: "pdfs",
  onDelete: "CASCADE",
});
UserPdf.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(CategoryStat, {
  foreignKey: "userId",
  as: "categoryStats",
  onDelete: "CASCADE",
});
CategoryStat.belongsTo(User, { foreignKey: "userId", as: "user" });

// ── Grupos / Clases ──────────────────────────────────────────────────────────
Group.belongsTo(User, { foreignKey: "ownerId", as: "owner" });
User.hasMany(Group, { foreignKey: "ownerId", as: "ownedGroups" });

Group.hasMany(GroupMember, {
  foreignKey: "groupId",
  as: "members",
  onDelete: "CASCADE",
});
GroupMember.belongsTo(Group, { foreignKey: "groupId", as: "group" });

GroupMember.belongsTo(User, { foreignKey: "userId", as: "member" });
User.hasOne(GroupMember, { foreignKey: "userId", as: "groupMembership" });

// ── Sesiones de usuario ───────────────────────────────────────────────────────
User.hasMany(UserSession, {
  foreignKey: "userId",
  as: "sessions",
  onDelete: "CASCADE",
});
UserSession.belongsTo(User, { foreignKey: "userId", as: "user" });

module.exports = {
  sequelize,
  User,
  Game,
  UserData,
  ItemsUser,
  Item,
  ItemCategory,
  UserPdf,
  CategoryStat,
  Activities,
  Group,
  GroupMember,
  UserSession,
  GeminiUsageLog,
};
