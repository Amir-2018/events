const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization; // lowercase

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('🔍 AUTH MIDDLEWARE: No token or invalid format');
    return res.status(401).json({ 
      success: false, 
      message: 'No token, authorization denied' 
    });
  }

  const token = authHeader.split(' ')[1];
  console.log('🔍 AUTH MIDDLEWARE: Token received:', token.substring(0, 20) + '...');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔍 AUTH MIDDLEWARE: Token decoded successfully:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.log('🔍 AUTH MIDDLEWARE: Token verification failed:', error.message);
    res.status(401).json({ 
      success: false, 
      message: 'Token is not valid' 
    });
  }
};

const optionalAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // Si le token est invalide on continue quand même pour l'accès public
    next();
  }
};

authMiddleware.optional = optionalAuthMiddleware;
module.exports = authMiddleware;
