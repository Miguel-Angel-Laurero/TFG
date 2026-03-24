const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const Item = sequelize.define("Item", {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  img: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: "item",
  timestamps: false,
});

module.exports = Item;