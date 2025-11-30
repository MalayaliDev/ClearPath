const jwt = require('jsonwebtoken');

function auth(requiredRoles = []) {
  return (req, res, next) => {
    const token = req.cookies?.token;

    // DEBUG: Log if cookie is present
    if (!token) {
      console.warn('❌ No token cookie found. Cookies received:', Object.keys(req.cookies || {}));
      return res.status(401).json({ message: 'No token provided' });
    }
    
    console.log('✅ Token cookie found, verifying...');

    try {
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not set');
        return res.status(500).json({ message: 'Server configuration error' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userRole = decoded.role || 'student'; // Default to student if role is missing
      
      req.user = {
        ...decoded,
        id: (decoded.id || decoded._id || '').toString(),
        role: userRole,
      };

      if (requiredRoles.length && !requiredRoles.includes(userRole)) {
        console.warn(`❌ Access denied. User role: ${userRole}, Required: ${requiredRoles.join(', ')}`);
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
