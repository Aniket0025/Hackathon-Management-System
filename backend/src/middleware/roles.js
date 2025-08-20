function requireRole(...roles) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role) return res.status(401).json({ message: 'Unauthorized' });
    if (!roles.includes(role)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}

// Allow public or authenticated users except specified roles. If user is not logged in, pass through.
function disallowRoles(...roles) {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

module.exports = { requireRole, disallowRoles };
