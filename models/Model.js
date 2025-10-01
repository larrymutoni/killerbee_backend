const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Model = sequelize.define('Model', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(250), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'DRAFT' } 
}, { tableName: 'Models' });

module.exports = Model;
