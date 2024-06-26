"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const error = (err, req, res, next)=>{
    res.status(err.statusCode || 500).json({
        message: err.message
    });
};
const _default = error;

//# sourceMappingURL=error.js.map