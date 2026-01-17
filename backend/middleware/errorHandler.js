// backend/middleware/errorHandler.js
// This should export a FUNCTION, not use module.exports at the end

module.exports = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ error: 'Validation Error', details: errors });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate entry', field: Object.keys(err.keyPattern)[0] });
  }
  
  // Default error
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal Server Error' 
  });
};
