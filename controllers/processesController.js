const Process = require('../models/Process');

exports.createProcess = async (req, res, next) => {
  try {
    const process = await Process.create({
      ...req.body,
      status: 'DRAFT'
    });
    res.status(201).json(process);
  } catch (err) { next(err); }
};

exports.getProcesses = async (req, res, next) => {
  try {
    switch(req.user.role) {
      case 4: // Production
        return res.json(await Process.findAll({ 
          where: { status: 'APPROVED' } 
        }));
      case 3: // Test
        return res.json(await Process.findAll({ 
          where: { status: ['DRAFT', 'PENDING_VALIDATION'] }
        }));
      case 2: // R&D
      case 1: // Admin
        return res.json(await Process.findAll());
      default:
        return res.status(403).json({ error: 'Invalid role' });
    }
  } catch (err) { next(err); }
};

exports.getProcessById = async (req, res, next) => {
  try {
    const process = await Process.findByPk(req.params.id);
    if (!process) {
      return res.status(404).json({ error: 'Process not found' });
    }
    
    if (req.user.role === 4 && process.status !== 'APPROVED') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(process);
  } catch (err) { next(err); }
};

exports.updateProcess = async (req, res, next) => {
  try {
    const process = await Process.findByPk(req.params.id);
    if (!process) {
      return res.status(404).json({ error: 'Process not found' });
    }
    
    if (process.status !== 'DRAFT') {
      return res.status(400).json({ error: 'Only DRAFT processes can be updated' });
    }
    
    await process.update(req.body);
    res.json(process);
  } catch (err) { next(err); }
};

exports.validateProcess = async (req, res, next) => {
  try {
    const process = await Process.findByPk(req.params.id);
    if (!process) {
      return res.status(404).json({ error: 'Process not found' });
    }

    if (process.status !== 'DRAFT') {
      return res.status(400).json({ error: 'Only DRAFT processes can be validated' });
    }

    await process.update({
      status: req.body.status === 'PASS' ? 'VALIDATED' : 'FAILED',
      testResults: req.body.testResults,
      validatedBy: req.user.sub,
      validatedAt: new Date()
    });

    res.json(process);
  } catch (err) { next(err); }
};

exports.deleteProcess = async (req, res, next) => {
  try {
    const process = await Process.findByPk(req.params.id);
    if (!process) {
      return res.status(404).json({ error: 'Process not found' });
    }
    await process.destroy();
    res.json({ message: 'Process deleted successfully' });
  } catch (err) { next(err); }
};