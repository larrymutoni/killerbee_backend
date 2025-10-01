const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'freezebeedb',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || '127.0.0.1', // local MySQL
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: console.log
  }
);

module.exports = { sequelize, Sequelize };
