function errorHandler(err, req, res, next) {
    res.status(err.statusCode || 500).json({
        error: {
            type: err.type || 'INTERNAL_SERVER_ERROR',
            message: err.message || 'Internal server error',
        },
    })
}

export { errorHandler }
