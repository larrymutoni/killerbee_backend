const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

exports.signup = async (req, res, next) => {
  try {
    console.log('Signup request received:', req.body);
    const { username, password, role } = req.body;

    const exists = await User.findOne({ where: { username } });
    if (exists) {
      console.log('Username already exists:', username);
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Remove manual hashing since User model hooks handle it
    const user = await User.create({ 
      username, 
      password, // Plain password - will be hashed by model hooks
      role 
    });
    
    console.log('User created:', user.id);
    return res.status(201).json({ 
      id: user.id, 
      username: user.username, 
      role: user.role 
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res, next) => {
  try {
    console.log('Login attempt:', { username: req.body.username });
    const { username, password } = req.body;
    
    const user = await User.findOne({ where: { username } });
    if (!user) {
      console.log('User not found:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      console.log('Password mismatch for user:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    console.log('Successful login:', username);
    const payload = { sub: user.id, role: user.role, username: user.username };
    const token = jwt.sign(
      payload, 
      process.env.JWT_SECRET || 'dev_secret_key', 
      { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
    );
    
    return res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: err.message });
  }
};