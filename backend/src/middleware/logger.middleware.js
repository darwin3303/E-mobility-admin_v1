export function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logColor = res.statusCode >= 400 ? '\x1b[31m' : res.statusCode >= 300 ? '\x1b[33m' : '\x1b[32m';
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl} - ${logColor}${res.statusCode}\x1b[0m (${duration}ms)`);
  });
  next();
}
