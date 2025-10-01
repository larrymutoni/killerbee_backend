const Model = require('../models/Model');


exports.createModel = async (req, res, next) => {
  try {
    const model = await Model.create({
      ...req.body,
      status: 'DRAFT'
    });
    res.status(201).json(model);
  } catch (err) { next(err); }
};

exports.getModels = async (req, res, next) => {
  try {
    switch(req.user.role) {
      case 4: // Production
        return res.json(await Model.findAll({ 
          where: { status: 'APPROVED' } 
        }));
      case 3: // Test
        return res.json(await Model.findAll({ 
          where: { status: ['DRAFT', 'PENDING_VALIDATION'] }
        }));
      case 2: // R&D
      case 1: // Admin
        return res.json(await Model.findAll());
      default:
        return res.status(403).json({ error: 'Invalid role' });
    }
  } catch (err) { next(err); }
};


exports.getApprovedModels = async (req, res, next) => {
  try {
    const models = await Model.findAll({
      where: { status: 'APPROVED' }
    });
    res.json(models);
  } catch (err) { next(err); }
};

exports.getModelById = async (req, res, next) => {
  try {
    const model = await Model.findByPk(req.params.id);
    if (!model) return res.status(404).json({ error: 'Model not found' });
    
    
    if (req.user.role === 4 && model.status !== 'APPROVED') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(model);
  } catch (err) { next(err); }
};

exports.updateModel = async (req, res, next) => {
  try {
    const model = await Model.findByPk(req.params.id);
    if (!model) return res.status(404).json({ error: 'Model not found' });
    
    if (model.status !== 'DRAFT') {
      return res.status(400).json({ error: 'Only DRAFT models can be updated' });
    }
    
    await model.update(req.body);
    res.json(model);
  } catch (err) { next(err); }
};


exports.validateModel = async (req, res, next) => {
  try {
    const model = await Model.findByPk(req.params.id);
    if (!model) return res.status(404).json({ error: 'Model not found' });
    
    if (model.status !== 'DRAFT') {
      return res.status(400).json({ error: 'Only DRAFT models can be validated' });
    }
    
    await model.update({ 
      status: req.body.status === 'PASS' ? 'VALIDATED' : 'FAILED',
      testResults: req.body.testResults,
      validatedBy: req.user.sub,
      validatedAt: new Date()
    });
    
    res.json(model);
  } catch (err) { next(err); }
};

exports.approveModel = async (req, res, next) => {
  try {
    const model = await Model.findByPk(req.params.id);
    if (!model) return res.status(404).json({ error: 'Model not found' });
    
    if (model.status !== 'VALIDATED') {
      return res.status(400).json({ error: 'Only VALIDATED models can be approved' });
    }
    
    await model.update({ 
      status: 'APPROVED',
      approvedBy: req.user.sub,
      approvedAt: new Date()
    });
    
    res.json(model);
  } catch (err) { next(err); }
};

exports.deleteModel = async (req, res, next) => {
  try {
    const model = await Model.findByPk(req.params.id);
    if (!model) return res.status(404).json({ error: 'Model not found' });
    await model.destroy();
    res.json({ message: 'Model deleted successfully' });
  } catch (err) { next(err); }
};