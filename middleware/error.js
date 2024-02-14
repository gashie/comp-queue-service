const { logger } = require("../logs/winston");
const ErrorResponse = require("../utils/errorResponse");
const errorHandler = (err, req, res, next) => {

    let error = { ...err };
    error.message = err.message;
    //Log to console for dev

    console.log(err);
    //mysql bad ObjectId
    if (err.code === '23505') {
        const message = `Duplicate entry found in request`;
        error = new ErrorResponse(message, 404);
        logger.error(error);
    }
    if (err.code === '22P02') {
        const message = `Invalid uuid in request`;
        error = new ErrorResponse(message, 404);
        logger.error(error);
    }
    
    if (err.code === '22007') {
        const message = `Invalid date/timestamp in request`;
        error = new ErrorResponse(message, 404);
        logger.error(error);
    }

    //42601  --invalid query
    if (err.type === "entity.parse.failed") {
        const message = `Sorry, Invalid Json Fields`;
        error = new ErrorResponse(message, 404);
        logger.error(error);
    }

    

    //mysql db access denied to user
    if (err.code === "ER_DBACCESS_DENIED_ERROR") {
        const message = `Db Access Denied`;
        error = new ErrorResponse(message, 404);
        logger.error(error.code);
    }

    if (err.code === "ER_BAD_FIELD_ERROR") {
        const message = `Unknown column in request`;
        error = new ErrorResponse(message, 404);
        logger.error(error.code);
    }

    if (err.code === "ER_TABLE_EXISTS_ERROR") {
        const message = `Table already exist`;
        error = new ErrorResponse(message, 404);
        logger.error(error.code);
    }
    if (err.code === "ER_NO_SUCH_TABLE") {
        const message = `Unknown table in request`;
        error = new ErrorResponse(message, 404);
        logger.error(error.code);
    }
    if (err.code === "EHOSTUNREACH") {
        logger.error(error.code);
        const message = `Server Failed to connect`;
        return res.status(500).json({
            status: 0,
            message: message,
        });
    }
    logger.error(error.message);
    res.status(error.statusCode || 500).json({
        status: 0,
        message: error.message || "Server Error",
    });
};

module.exports = errorHandler;
