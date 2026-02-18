const errorHandler = (err, req, res, next) => {
  // Log the error for debugging purposes
  console.error({
    message: err.message,
    stack: err.stack,
    name: err.name,
    path: req.path,
    method: req.method
  });
  
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    // Extract a more user-friendly message from the validation error object
    const messages = Object.values(err.errors).map(val => val.message);
    message = messages.join(', ');
  }

  res.status(statusCode).json({
    message: message,
    // Provide stack trace only in development environment
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export default errorHandler;