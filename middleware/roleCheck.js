module.exports = function(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user || typeof req.user.role !== 'number') return res.status(401).json({ error: 'Unauthenticated' });
    if (!allowedRoles.includes(req.user.role)) return res.status(403).json({ error: 'Access denied' });
    return next();
  };
};
