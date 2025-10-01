const express = require('express');
const router = express.Router();
const controller = require('../controllers/processesController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validate');
const Joi = require('joi');

const processSchema = Joi.object({
  modelId: Joi.string().uuid().required(),
  steps: Joi.string().required(),
  status: Joi.string().valid('DRAFT').default('DRAFT')
});

const validationSchema = Joi.object({
  status: Joi.string().valid('PASS', 'FAIL').required(),
  testResults: Joi.string().required()
});

router.use(auth);

// R&D Routes
router.post('/', roleCheck([1,2]), validate(processSchema), controller.createProcess);
router.put('/:id', roleCheck([1,2]), validate(processSchema), controller.updateProcess);

// Test Department Routes
router.post('/:id/validate', roleCheck([3]), validate(validationSchema), controller.validateProcess);

// Common Routes
router.get('/', controller.getProcesses);
router.get('/:id', controller.getProcessById);

// Admin only
router.delete('/:id', roleCheck([1]), controller.deleteProcess);

module.exports = router;