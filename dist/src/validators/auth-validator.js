"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    loginSchema: function() {
        return loginSchema;
    },
    registerSchema: function() {
        return registerSchema;
    }
});
const _joi = _interop_require_default(require("joi"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const registerSchema = _joi.default.object({
    firstname: _joi.default.string().trim(),
    lastname: _joi.default.string().trim(),
    address: _joi.default.string().trim(),
    id_passpost: _joi.default.string().trim().pattern(/^[0-9]{13}/),
    email: _joi.default.string().email().required(),
    password: _joi.default.string().pattern(/^[a-zA-Z0-9.-@]{6,30}$/).trim().required(),
    confirm_password: _joi.default.any().valid(_joi.default.ref("password")).required().messages({
        "any.only": "Confirm password must match password"
    }).strip(),
    role: _joi.default.string().optional(),
    status: _joi.default.string().optional()
});
const loginSchema = _joi.default.object({
    email: _joi.default.string().trim().required(),
    password: _joi.default.string().trim().required()
});

//# sourceMappingURL=auth-validator.js.map