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
    createZone: function() {
        return createZone;
    },
    getZone: function() {
        return getZone;
    }
});
const _prisma = _interop_require_default(require("../models/prisma"));
const _createerror = _interop_require_default(require("../utils/create-error"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const createZone = async (req, res, next)=>{
    try {
        const { role } = req.user;
        const values = req.body;
        if (role !== "ADMIN") {
            return next((0, _createerror.default)("not admin", 401));
        }
        const result = await _prisma.default.zone.create({
            data: values
        });
        res.status(201).json({
            message: "ok",
            zone: result
        });
    } catch (error) {
        next(error);
    }
};
const getZone = async (req, res, next)=>{
    try {
        const { role } = req.user;
        if (role !== "ADMIN") {
            return next((0, _createerror.default)("not admin", 201));
        }
        const result = await _prisma.default.zone.findMany();
        res.status(200).json({
            message: "ok",
            result
        });
    } catch (error) {
        next(error);
    }
};

//# sourceMappingURL=zone-controller.js.map