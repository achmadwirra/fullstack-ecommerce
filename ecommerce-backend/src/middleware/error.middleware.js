const AppError = require('../common/errors/AppError');

const errorMiddleware = (err, req, res, next) => {

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            error: {
                code: err.code,
                details: err.details
            }
        });
    }

    console.error(err);

    return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: {
            code: "INTERNAL_SERVER_ERROR",
            details: null
        }
    });
};

module.exports = errorMiddleware;