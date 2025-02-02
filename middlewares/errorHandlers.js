export const errorResponseHandler = async (err, req, res, next) => {
  const statusCode = err.statusCode || 404;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export const invalidPathHandler = async (err, req, res, next) => {
  let error = new Error("Invalid Path!");
  err.statusCode = 404;
  next(error);
};
