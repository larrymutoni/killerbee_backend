const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Ingredient = sequelize.define('Ingredient', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true }
}, { tableName: 'Ingredients' });

module.exports = Ingredient;
