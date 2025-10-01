const express = require('express');
const router = express.Router();
const controller = require('../controllers/communicationsController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validate');
const Joi = require('joi');

const schema = Joi.object({
  receiver: Joi.string().max(256).required(),
  content: Joi.string().required() // plaintext; service will encrypt
});

router.use(auth);

router.post('/', roleCheck([1,2,3,4]), validate(schema), controller.sendMessage);
router.get('/', roleCheck([1,2,3,4]), controller.getMessages);

module.exports = router;
