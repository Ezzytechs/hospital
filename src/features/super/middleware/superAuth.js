const jwt = require('jsonwebtoken');

async function superAdminAuth(req, res, next) {
  try {
    const h = req.headers.authorization;
    
    if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ message: 'Authorization header missing' });

    const token = h.split(' ')[1];
    const payload = jwt.verify(token, process.env.SUPERADMIN_ACCESS_TOKEN);
    // payload should contain superAdminId
    if (!payload || !payload.adminId) return res.status(401).json({ message: 'Invalid token' });

    req.superAdmin = payload;
    next();
  } catch (err) {
    console.error('superAuth error', err);
    return res.status(401).json({ message: 'Unauthorized', error: err.message });
  }
}

module.exports = superAdminAuth;
