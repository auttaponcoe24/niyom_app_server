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
const createError = (message, statusCode)=>{
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};
const _default = createError;

//# sourceMappingURL=create-error.js.map