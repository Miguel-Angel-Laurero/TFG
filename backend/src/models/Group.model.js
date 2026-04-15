const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const Group = sequelize.define(
  "Group",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(80),
      allowNull: false,
      validate: { len: [3, 80] },
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    inviteCode: {
      type: DataTypes.STRING(8),
      allowNull: false,
      unique: true,
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Users", key: "id" },
    },
  },
  {
    tableName: "groups",
    timestamps: true,
  },
);

module.exports = Group;
