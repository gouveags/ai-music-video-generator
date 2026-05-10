export function errorHandler(error, _req, res, _next) {
  console.error(error);

  res.status(500).json({
    error: 'Internal server error',
    message: error.message,
  });
}
