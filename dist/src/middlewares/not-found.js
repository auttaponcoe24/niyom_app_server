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
const notFound = (req, res, next)=>{
    res.status(404).json({
        message: "resource not found on this server"
    });
};
const _default = notFound;

//# sourceMappingURL=not-found.js.map