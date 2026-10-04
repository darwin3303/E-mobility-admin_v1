// In-memory sliding window rate limiter for login attempts
const loginAttempts = new Map();

// Default config: 10 attempts per 15 minutes
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

// Periodic cleanup of expired entries (every 10 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of loginAttempts.entries()) {
    if (now - record.startTime > WINDOW_MS) {
      loginAttempts.delete(key);
    }
  }
}, 10 * 60 * 1000);

export function loginRateLimiter(req, res, next) {
  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-client';
  const now = Date.now();

  const record = loginAttempts.get(clientIp);

  if (!record) {
    loginAttempts.set(clientIp, {
      count: 1,
      startTime: now
    });
    return next();
  }

  // If window has passed, reset count
  if (now - record.startTime > WINDOW_MS) {
    record.count = 1;
    record.startTime = now;
    return next();
  }

  // Check if limit exceeded
  if (record.count >= MAX_ATTEMPTS) {
    const remainingSec = Math.ceil((WINDOW_MS - (now - record.startTime)) / 1000);
    return res.status(429).json({
      success: false,
      message: `Too many login attempts. Please try again in ${Math.ceil(remainingSec / 60)} minute(s).`
    });
  }

  record.count += 1;
  next();
}

/**
 * Optional helper to reset attempt count upon successful authentication
 */
export function resetLoginAttempts(req) {
  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-client';
  loginAttempts.delete(clientIp);
}

// Rate limiter for set-password attempts (5 attempts per 15 minutes)
const setPasswordAttempts = new Map();
const SET_PASSWORD_WINDOW_MS = 15 * 60 * 1000;
const SET_PASSWORD_MAX_ATTEMPTS = 5;

setInterval(() => {
  const now = Date.now();
  for (const [key, record] of setPasswordAttempts.entries()) {
    if (now - record.startTime > SET_PASSWORD_WINDOW_MS) {
      setPasswordAttempts.delete(key);
    }
  }
}, 10 * 60 * 1000);

export function setPasswordRateLimiter(req, res, next) {
  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-client';
  const now = Date.now();

  const record = setPasswordAttempts.get(clientIp);

  if (!record) {
    setPasswordAttempts.set(clientIp, {
      count: 1,
      startTime: now
    });
    return next();
  }

  if (now - record.startTime > SET_PASSWORD_WINDOW_MS) {
    record.count = 1;
    record.startTime = now;
    return next();
  }

  if (record.count >= SET_PASSWORD_MAX_ATTEMPTS) {
    const remainingSec = Math.ceil((SET_PASSWORD_WINDOW_MS - (now - record.startTime)) / 1000);
    return res.status(429).json({
      success: false,
      message: `Too many password reset attempts from this IP. Please try again in ${Math.ceil(remainingSec / 60)} minute(s).`
    });
  }

  record.count += 1;
  next();
}
