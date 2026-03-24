const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const ItemsUser = sequelize.define("ItemsUser", {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  is_equipped: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: "items_user",
  timestamps: false,
});

module.exports = ItemsUser;