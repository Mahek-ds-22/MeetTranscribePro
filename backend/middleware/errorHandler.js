module.exports = function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err.message || err);
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.details || [err.message]
    });
  }
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error'
  });
};
