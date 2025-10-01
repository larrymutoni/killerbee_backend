// dev-only token generator (not for production)
require('dotenv').config();
const jwt = require('jsonwebtoken');

const args = process.argv.slice(2);
const username = args[0] || 'devuser';
const role = parseInt(args[1], 10) || 2; // default R&D

const payload = { sub: username, username, role };
const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret_key', { expiresIn: process.env.JWT_EXPIRES_IN || '2h' });
console.log('Use this token (Authorization: Bearer <token>):\n', token);
