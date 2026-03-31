const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    // req.user is set by authMiddleware and contains the decoded token
    if (!req.user || req.user.role !== requiredRole) {
      return res.status(403).json({
        success: false,
        message: `Accès refusé. Rôle ${requiredRole} requis.`
      });
    }
    next();
  };
};

module.exports = roleMiddleware;
