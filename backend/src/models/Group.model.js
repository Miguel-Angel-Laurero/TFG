const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const { randomUUID } = require("crypto");

const Group = sequelize.define("Group", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: { len: [3, 100] },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null,
  },
  inviteCode: {
    type: DataTypes.STRING(36),
    allowNull: false,
    unique: true,
    defaultValue: () => randomUUID(),
  },
  gameType: {
    type: DataTypes.ENUM("quiz", "flashcards", "both"),
    defaultValue: "both",
    allowNull: false,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "Users", key: "id" },
  },
});

module.exports = Group;
