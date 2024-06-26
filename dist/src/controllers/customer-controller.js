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
    createCustomer: function() {
        return createCustomer;
    },
    editCustomer: function() {
        return editCustomer;
    },
    getAllCustomer: function() {
        return getAllCustomer;
    }
});
const _prisma = _interop_require_default(require("../models/prisma"));
const _createerror = _interop_require_default(require("../utils/create-error"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const createCustomer = async (req, res, next)=>{
    try {
        const { role } = req.user;
        if (role !== "ADMIN") {
            return next((0, _createerror.default)("not admin", 401));
        }
        const values = req.body;
        const result = await _prisma.default.customer.create({
            data: values
        });
        res.status(201).json({
            message: "ok",
            result
        });
    } catch (error) {
        next(error);
    }
};
const getAllCustomer = async (req, res, next)=>{
    try {
        const { role } = req.user;
        if (role !== "ADMIN") {
            return next((0, _createerror.default)("not admin", 200));
        }
        const result = await _prisma.default.customer.findMany({
            include: {
                zone: true
            }
        });
        res.status(200).json({
            message: "ok",
            result
        });
    } catch (error) {
        next(error);
    }
};
const editCustomer = async (req, res, next)=>{
    try {
        const { role } = req.user;
        const { customerId } = req.query;
        const { id_passpost, firstname, lastname, phone_number, house_number, address, zoneId } = req.body;
        if (role !== "ADMIN") {
            return next((0, _createerror.default)("not admin", 401));
        }
        const findCustomer = await _prisma.default.customer.findUnique({
            where: {
                id: Number(customerId)
            }
        });
        const customer = await _prisma.default.customer.update({
            where: {
                id: findCustomer.id
            },
            data: {
                id_passpost,
                firstname,
                lastname,
                phone_number,
                house_number,
                address,
                zoneId
            }
        });
        res.status(201).json({
            message: "ok",
            customer
        });
    } catch (error) {
        next(error);
    }
};

//# sourceMappingURL=customer-controller.js.map