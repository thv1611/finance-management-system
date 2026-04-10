function errorMiddleware(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error(`[${req.method} ${req.originalUrl}]`, {
    statusCode,
    message,
    stack: err.stack,
    cause: err.cause
      ? {
          message: err.cause.message,
          data: err.cause.response?.data,
        }
      : undefined,
  });

  return res.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = errorMiddleware;
