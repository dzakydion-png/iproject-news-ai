function errorHandler(err, req, res, next) {
    console.log(err); 

    let status = 500;
    let message = "Internal Server Error";

    if (err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError") {
        status = 400;
        message = err.errors[0].message;
    } else if (err.name === "EmailPasswordInvalid") {
        status = 401;
        message = "Invalid email or password";
    } else if (err.name === "Unauthenticated" || err.name === "JsonWebTokenError") {
        status = 401;
        message = "Please login first";
    } else if (err.name === "NotFound") {
        status = 404;
        message = "Data not found";
    }

    res.status(status).json({ message });
}

module.exports = errorHandler;