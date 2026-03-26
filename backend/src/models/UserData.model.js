const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const UserData = sequelize.define("UserData", {
  id_data: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  coins: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  timeSpent: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  streak: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  accuracy: {
    type: DataTypes.SMALLINT,
    defaultValue: 0,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  last_claimed_at:   {
      type: DataTypes.DATE,
      defaultValue: null,
      allowNull: true,
  },
  first_login: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
}, {
  tableName: "user_data",   // ← apunta a la tabla correcta
  timestamps: false         // ← evita que Sequelize busque createdAt/updatedAt
});

module.exports = UserData;