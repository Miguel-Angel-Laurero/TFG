const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const GroupMember = sequelize.define(
  "GroupMember",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "groups", key: "id" },
    },
    // Índice único en userId garantiza que un usuario solo puede estar en 1 grupo a la vez
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: "Users", key: "id" },
    },
    joinedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "group_members",
    timestamps: false,
    indexes: [{ unique: true, fields: ["userId"] }],
  },
);

module.exports = GroupMember;
