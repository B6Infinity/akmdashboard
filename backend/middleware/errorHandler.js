// Centralized error handling middleware
// Must have 4 parameters for Express to recognize as error handler
const errorHandler = (err, _req, res, _next) => {
  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, error: messages.join(". ") });
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({ success: false, error: "Invalid ID format." });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    return res.status(409).json({ success: false, error: "Duplicate entry." });
  }

  // Default to 500
  const statusCode = err.statusCode || 500;
  console.error(`[Error] ${err.message}`, err.stack);
  res.status(statusCode).json({
    success: false,
    error: statusCode === 500 ? "Internal Server Error" : err.message,
  });
};

export default errorHandler;
