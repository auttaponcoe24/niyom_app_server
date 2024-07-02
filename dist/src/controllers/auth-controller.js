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
    editProfile: function() {
        return editProfile;
    },
    getProfile: function() {
        return getProfile;
    },
    login: function() {
        return login;
    },
    register: function() {
        return register;
    },
    updateAccess: function() {
        return updateAccess;
    }
});
const _prisma = _interop_require_default(require("../models/prisma"));
const _bcryptjs = _interop_require_default(require("bcryptjs"));
const _jsonwebtoken = _interop_require_default(require("jsonwebtoken"));
const _authvalidator = require("../validators/auth-validator");
const _createerror = _interop_require_default(require("../utils/create-error"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const register = async (req, res, next)=>{
    try {
        const { email, password } = req.body;
        const hashPassword = await _bcryptjs.default.hash(password, 12);
        const data = await _prisma.default.user.create({
            data: {
                email: email,
                password: hashPassword
            }
        });
        const payload = {
            id: data.id,
            id_passpost: data.id_passpost,
            firstname: data.firstname,
            lastname: data.lastname,
            role: data.role
        };
        const accessToken = _jsonwebtoken.default.sign(payload, process.env.JWT_SECREY_KEY || 'secretKeyRandom', {
            expiresIn: process.env.JWT_EXPIRES_IN || '30d'
        });
        delete data.password;
        res.status(201).json({
            message: 'ok',
            user: data,
            accessToken: accessToken
        });
    } catch (error) {
        next(error);
    }
};
const login = async (req, res, next)=>{
    try {
        const { value, error } = _authvalidator.loginSchema.validate(req.body);
        if (error) {
            return next((0, _createerror.default)('email incorrect or password incorrect', 400));
        }
        const user = await _prisma.default.user.findUnique({
            where: {
                email: value.email
            }
        });
        if (!user) {
            return next((0, _createerror.default)('mail is not found', 400));
        }
        const isMatch = await _bcryptjs.default.compare(value.password, user.password);
        if (!isMatch) {
            return next((0, _createerror.default)('password incorrect', 400));
        }
        const payload = {
            id: user.id,
            id_passpost: user.id_passpost,
            firstname: user.firstname,
            lastname: user.lastname,
            role: user.role
        };
        const accessToken = _jsonwebtoken.default.sign(payload, process.env.JWT_SECRET_KEY || 'secretKeyRandom', {
            expiresIn: process.env.JWT_EXPIRES_IN || '30d'
        });
        delete user.password;
        res.status(200).json({
            message: 'ok',
            user: user,
            accessToken: accessToken
        });
    } catch (error) {
        next(error);
    }
};
const getProfile = async (req, res, next)=>{
    try {
        res.status(200).json({
            message: 'ok',
            user: req.user
        });
    } catch (error) {
        next(error);
    }
};
const editProfile = async (req, res, next)=>{
    try {
        const { id } = req.user;
        const { firstname, lastname, id_passpost, address } = req.body;
        const findUser = await _prisma.default.user.update({
            where: {
                id: id
            },
            data: {
                firstname,
                lastname,
                id_passpost,
                address
            }
        });
        res.status(201).json({
            message: 'ok',
            result: findUser
        });
    } catch (error) {
        next(error);
    }
};
const updateAccess = async (req, res, next)=>{
    try {
        const { role } = req.user;
        const { id, update } = req.query;
        if (role !== 'ADMIN') {
            return next((0, _createerror.default)('is not admin', 401));
        }
        const findUser = await _prisma.default.user.findUnique({
            where: {
                id: id
            }
        });
        if (update === 'SUCCESS') {
            const result = await _prisma.default.user.update({
                where: {
                    id: findUser.id
                },
                data: {
                    status: 'SUCCESS'
                }
            });
            res.status(201).json({
                message: 'ok',
                result
            });
        } else if (update === 'REJECT') {
            const result = await _prisma.default.user.update({
                where: {
                    id: findUser.id
                },
                data: {
                    status: 'REJECT'
                }
            });
            res.status(201).json({
                message: 'ok',
                result
            });
        } else {
            return next((0, _createerror.default)('update is missing', 401));
        }
    } catch (error) {
        next(error);
    }
};

//# sourceMappingURL=auth-controller.js.map