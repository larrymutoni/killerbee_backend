const express = require('express');
const router = express.Router();
const controller = require('../controllers/modelsController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validate');
const Joi = require('joi');

const modelSchema = Joi.object({
  name: Joi.string().min(1).max(250).required(),
  description: Joi.string().allow('', null),
  status: Joi.string().valid('DRAFT').default('DRAFT')
});

router.use(auth);

// R&D Routes
router.post('/', roleCheck([1,2]), validate(modelSchema), controller.createModel);
router.put('/:id', roleCheck([1,2]), validate(modelSchema), controller.updateModel);

// Test Department Routes
router.post('/:id/validate', roleCheck([3]), controller.validateModel);

// Production Routes
router.get('/approved', roleCheck([4]), controller.getApprovedModels);

// Common Routes
router.get('/', controller.getModels); // Role-filtered in controller
router.get('/:id', controller.getModelById);

// Admin only
router.delete('/:id', roleCheck([1]), controller.deleteModel);
router.post('/:id/approve', roleCheck([1]), controller.approveModel);

module.exports = router;