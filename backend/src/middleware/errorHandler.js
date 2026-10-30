export const errorHandler = (err, req, res, next) => {
  console.error('[OpticGuard Error]', err.stack || err.message || err);
  
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Visual Intelligence Engine Error',
    statusCode,
    timestamp: new Date().toISOString()
  });
};

