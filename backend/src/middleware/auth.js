const jwt = require('jsonwebtoken');

function auth(requiredRoles = []) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not set');
        return res.status(500).json({ message: 'Server configuration error' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = {
        ...decoded,
        id: (decoded.id || decoded._id || '').toString(),
      };

      if (requiredRoles.length && !requiredRoles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        console.warn('JWT expired for user request');
        return res.status(401).json({ message: 'Token expired. Please log in again.' });
      }

      console.error('JWT verification failed', err);
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}

module.exports = auth;
