function errorHandler(err, req, res, next) {
  let status = 500;
  let message = "Internal Server Error";

  console.log(err); 

  if (err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError") {
    status = 400;
    message = err.errors[0].message;
  } else if (err.name === "InvalidToken" || err.name === "JsonWebTokenError") {
    status = 401;
    message = "Invalid Token";
  } else if (err.name === "NotFound") {
    status = 404;
    message = "Data not found";
  } else if (err.name === "Forbidden") {
    status = 403;
    message = "Forbidden Access";
  }

  res.status(status).json({ message });
}

module.exports = errorHandler;