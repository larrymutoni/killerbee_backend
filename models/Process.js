const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Model = require('./Model');

const Process = sequelize.define('Process', {
  id: { 
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true 
  },
  modelId: { 
    type: DataTypes.UUID, 
    allowNull: false 
  },
  steps: { 
    type: DataTypes.TEXT, 
    allowNull: true 
  },
  status: { 
    type: DataTypes.STRING(50), 
    allowNull: false, 
    defaultValue: 'DRAFT',
    validate: {
      isIn: [['DRAFT', 'PENDING_VALIDATION', 'VALIDATED', 'FAILED', 'APPROVED']]
    }
  },
  testResults: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  validatedBy: {
    type: DataTypes.UUID,
    allowNull: true
  },
  validatedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, { 
  tableName: 'Processes' 
});

Process.belongsTo(Model, { foreignKey: 'modelId' });

module.exports = Process;