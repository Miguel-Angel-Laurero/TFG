const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const GeminiUsageLog = sequelize.define("GeminiUsageLog", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  model: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  promptTokens: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  outputTokens: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  totalTokens: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  cost: {
    type: DataTypes.DECIMAL(12, 8),
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = GeminiUsageLog;
