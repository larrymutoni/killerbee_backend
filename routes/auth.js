const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const validate = require('../middleware/validate');
const Joi = require('joi');

const signupSchema = Joi.object({
  username: Joi.string().min(3).required(),
  password: Joi.string().min(6).required(),
  role: Joi.number().integer().min(1).max(4).required()
});

// Public routes
router.post('/signup', validate(signupSchema), controller.signup);
router.post('/login', controller.login);

module.exports = router;