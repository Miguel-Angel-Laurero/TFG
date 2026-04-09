const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const GroupMember = sequelize.define("GroupMember", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "Groups", key: "id" },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "Users", key: "id" },
  },
  role: {
    type: DataTypes.ENUM("owner", "member"),
    defaultValue: "member",
    allowNull: false,
  },
});

module.exports = GroupMember;
