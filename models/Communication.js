const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Communication = sequelize.define('Communication', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  sender: { type: DataTypes.STRING(256), allowNull: true },
  receiver: { type: DataTypes.STRING(256), allowNull: true },
  content: { type: DataTypes.BLOB('long'), allowNull: true }, 
  iv: { type: DataTypes.BLOB('tiny'), allowNull: true },
  encryptedFlag: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'Communications' });

module.exports = Communication;
