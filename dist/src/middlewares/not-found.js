var notFound = function(req, res, next) {
    res.status(404).json({
        message: "resource not found on this server"
    });
};
export default notFound;

//# sourceMappingURL=not-found.js.map