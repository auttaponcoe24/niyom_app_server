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
const _jsonwebtoken = _interop_require_default(require("jsonwebtoken"));
const _prisma = _interop_require_default(require("../models/prisma"));
const _createerror = _interop_require_default(require("../utils/create-error"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const authMiddleware = async (req, res, next)=>{
    try {
        const authorization = req.headers.authorization;
        if (!authorization) {
            return next((0, _createerror.default)("unauthenticated", 401));
        }
        const token = authorization.split(" ")[1];
        const payload = _jsonwebtoken.default.verify(token, process.env.JWT_SECRET_KEY || "secretKeyRandom");
        const user = await _prisma.default.user.findUnique({
            where: {
                id: payload.id
            }
        });
        if (!user) {
            return next((0, _createerror.default)("unauthenticated", 401));
        }
        delete user.password;
        req.user = user;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError" || "JsonWebTokenError") {
            error.statusCode = 401;
        }
        next(error);
    }
};
const _default = authMiddleware;

//# sourceMappingURL=authenticate.js.map