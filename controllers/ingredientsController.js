const Ingredient = require('../models/Ingredient');

exports.createIngredient = async (req, res, next) => {
  try {
    const ingredient = await Ingredient.create({
      ...req.body,
      status: 'DRAFT'
    });
    res.status(201).json(ingredient);
  } catch (err) { next(err); }
};

exports.getIngredients = async (req, res, next) => {
  try {
    switch(req.user.role) {
      case 4: // Production
        return res.json(await Ingredient.findAll({ 
          where: { status: 'APPROVED' } 
        }));
      case 3: // Test
        return res.json(await Ingredient.findAll({ 
          where: { status: ['DRAFT', 'PENDING_VALIDATION'] }
        }));
      case 2: // R&D
      case 1: // Admin
        return res.json(await Ingredient.findAll());
      default:
        return res.status(403).json({ error: 'Invalid role' });
    }
  } catch (err) { next(err); }
};

exports.getApprovedIngredients = async (req, res, next) => {
  try {
    const ingredients = await Ingredient.findAll({
      where: { status: 'APPROVED' }
    });
    res.json(ingredients);
  } catch (err) { next(err); }
};

exports.getIngredientById = async (req, res, next) => {
  try {
    const ingredient = await Ingredient.findByPk(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }
    
    if (req.user.role === 4 && ingredient.status !== 'APPROVED') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(ingredient);
  } catch (err) { next(err); }
};

exports.updateIngredient = async (req, res, next) => {
  try {
    const ingredient = await Ingredient.findByPk(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }
    
    if (ingredient.status !== 'DRAFT') {
      return res.status(400).json({ error: 'Only DRAFT ingredients can be updated' });
    }
    
    await ingredient.update(req.body);
    res.json(ingredient);
  } catch (err) { next(err); }
};

exports.deleteIngredient = async (req, res, next) => {
  try {
    const ingredient = await Ingredient.findByPk(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }
    await ingredient.destroy();
    res.json({ message: 'Ingredient deleted successfully' });
  } catch (err) { next(err); }
};