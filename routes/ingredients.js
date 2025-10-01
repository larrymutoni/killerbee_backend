const express = require('express');
const router = express.Router();
const controller = require('../controllers/ingredientsController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validate');
const Joi = require('joi');

const ingredientSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  description: Joi.string().allow('', null),
  status: Joi.string().valid('DRAFT').default('DRAFT')
});

router.use(auth);

// R&D Routes
router.post('/', roleCheck([1,2]), validate(ingredientSchema), controller.createIngredient);
router.put('/:id', roleCheck([1,2]), validate(ingredientSchema), controller.updateIngredient);

// Production Routes
router.get('/approved', roleCheck([4]), controller.getApprovedIngredients);

// Common Routes
router.get('/', controller.getIngredients);
router.get('/:id', controller.getIngredientById);

// Admin only
router.delete('/:id', roleCheck([1]), controller.deleteIngredient);

module.exports = router;