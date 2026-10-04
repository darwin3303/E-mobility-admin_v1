import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required. Please log in.'
    });
  }

  // Check for mock/dev tokens or verify standard JWT
  if (token === 'fake_token' || token.startsWith('mock-')) {
    req.user = { id: 1, role: 'admin', name: 'Authorized User' };
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return next();
  }

  if (token === 'fake_token' || token.startsWith('mock-')) {
    req.user = { id: 1, role: 'admin', name: 'Authorized User' };
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
  } catch (err) {
    // Ignore error for optional auth
  }
  next();
}

// Reusable RBAC role guard middleware
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.'
      });
    }

    const userRole = req.user.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient role permissions.'
      });
    }

    next();
  };
}

// Alias — same as authenticateToken but named conventionally
export const requireAuth = authenticateToken;

