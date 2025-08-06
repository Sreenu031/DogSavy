const jwt = require('jsonwebtoken');
function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    return res.status(401).json({ message: 'Unauthorized. Please login.' });
  }
}

function checkRole(role) {
  return function (req, res, next) {
    if (req.session && req.session.user && req.session.user.role === role) {
      return next();
    } else {
      return res.status(403).json({ message: 'Forbidden. Access denied.' });
    }
  };
}


function getuserId (req, res, next)  {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, 'secretkey');
    req.user = decoded; // decoded.id is the user ID
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = {
  ensureAuthenticated,
  checkRole,
  getuserId
};
