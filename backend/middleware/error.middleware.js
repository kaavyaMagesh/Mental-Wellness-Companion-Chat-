// middleware/error.middleware.js
import { validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }
  next();
};

export const globalErrorHandler = (err, req, res, next) => {
  console.error(`[Server Error]: ${err.message || err}`);
  return res.status(err.status || 500).json({
    success: false,
    error: err.name || "InternalServerError",
    details: err.message || "An unexpected error occurred on the server."
  });
};
export default globalErrorHandler;
