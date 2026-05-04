const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const UserSession = sequelize.define(
  "UserSession",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // ms epoch enviado desde el frontend (Date.now())
    timestamp: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    pdfId: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    // { [category]: { correct, total, failedIds: number[] } }
    stats: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
    summary: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
  },
  {
    tableName: "user_sessions",
    timestamps: false,
  },
);

module.exports = UserSession;
