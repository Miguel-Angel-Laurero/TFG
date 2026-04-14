const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const Activity = sequelize.define("Activity", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
}, {
    tableName: "activities",
    timestamps: false,
});

module.exports = Activity;