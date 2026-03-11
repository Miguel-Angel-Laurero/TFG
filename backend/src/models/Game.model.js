const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Game = sequelize.define('Game', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },
  gameName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  duration: {
    // duración en segundos
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  result: {
    type: DataTypes.ENUM('win', 'loss', 'draw'),
    allowNull: true,
  },
  playedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = Game;
