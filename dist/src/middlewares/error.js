var error = function(err, req, res, next) {
    res.status(err.statusCode || 500).json({
        message: err.message
    });
};
export default error;

//# sourceMappingURL=error.js.map