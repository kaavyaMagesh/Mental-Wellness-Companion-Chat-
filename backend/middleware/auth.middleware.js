// middleware/auth.middleware.js
import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
      details: "Missing or malformed Authorization header"
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.user = { id: decoded.sub || decoded.id, role: decoded.role || 'user' };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
      details: "Invalid or expired authorization token"
    });
  }
};
