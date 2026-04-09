const sequelize = require("../../config/database");
const User = require("./User.model");
const Game = require("./Game.model");
const UserData = require("./UserData.model");
const ItemsUser = require("./ItemsUser.model");
const Item = require("./Item.model");
const Group = require("./Group.model");
const GroupMember = require("./GroupMember.model");

// ── Asociaciones ────────────────────────────────────────────────────────────
User.hasMany(Game, { foreignKey: "userId", as: "games", onDelete: "CASCADE" });
Game.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasOne(UserData, { foreignKey: "user_id", as: "userData" }); 
UserData.belongsTo(User, { foreignKey: "user_id", as: "user" });

User.hasMany(ItemsUser, { foreignKey: "user_id", as: "items" });
ItemsUser.belongsTo(User, { foreignKey: "user_id", as: "user" });

Item.hasMany(ItemsUser, { foreignKey: "item_id", as: "owners" });
ItemsUser.belongsTo(Item, { foreignKey: "item_id", as: "item" });

// Group associations
User.hasMany(Group, { foreignKey: "createdBy", as: "ownedGroups", onDelete: "CASCADE" });
Group.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

Group.hasMany(GroupMember, { foreignKey: "groupId", as: "members", onDelete: "CASCADE" });
GroupMember.belongsTo(Group, { foreignKey: "groupId", as: "group" });

User.hasMany(GroupMember, { foreignKey: "userId", as: "groupMemberships", onDelete: "CASCADE" });
GroupMember.belongsTo(User, { foreignKey: "userId", as: "user" });

module.exports = { sequelize, User, Game, UserData, ItemsUser, Item, Group, GroupMember };
