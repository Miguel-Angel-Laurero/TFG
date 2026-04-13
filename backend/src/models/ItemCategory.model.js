const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const ItemCategory = sequelize.define("ItemCategory", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: "item_category", // ajusta al nombre real de tu tabla
  timestamps: false,
});

module.exports = ItemCategory;