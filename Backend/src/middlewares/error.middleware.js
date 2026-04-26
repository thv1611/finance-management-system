function isExpectedAuthError(statusCode, message) {
  return (
    statusCode === 401 &&
    ["Authentication required", "Invalid or expired access token"].includes(message)
  );
}

function errorMiddleware(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const logPayload = {
    statusCode,
    message,
    ...(isExpectedAuthError(statusCode, message)
      ? {}
      : {
          stack: err.stack,
          cause: err.cause
            ? {
                message: err.cause.message,
                data: err.cause.response?.data,
              }
            : undefined,
        }),
  };

  if (isExpectedAuthError(statusCode, message)) {
    console.warn(`[${req.method} ${req.originalUrl}]`, logPayload);
  } else {
    console.error(`[${req.method} ${req.originalUrl}]`, logPayload);
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = errorMiddleware;
