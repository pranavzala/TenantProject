const handleInternalServerError = (res, error) => {
    console.error('Internal Server Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  };
  
  const handleDuplicateKeyError = (res) => {
    res.status(400).json({ error: 'Resource with the same key already exists.' });
  };
  
  const handleValidationError = (res, error) => {
    const validationErrors = Object.values(error.errors).map((err) => err.message);
    res.status(400).json({ error: 'Validation error', validationErrors });
  };
  
  const handleNotFoundError = (res, resource) => {
    res.status(404).json({ error: `${resource} not found` });
  };
  
  const errorMiddleware = (err, req, res, next) => {
    if (err.code === 11000) {
      handleDuplicateKeyError(res);
    } else if (err.name === 'ValidationError') {
      handleValidationError(res, err);
    } else {
      handleInternalServerError(res, err);
    }
  };
  
  module.exports = { errorMiddleware, handleNotFoundError };
  