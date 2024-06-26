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
    createTransaction: function() {
        return createTransaction;
    },
    getTransaction: function() {
        return getTransaction;
    }
});
const _prisma = _interop_require_default(require("../models/prisma"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const createTransaction = async (req, res, next)=>{
    try {
        const { month, year, unit_old_date, unit_new_date, type, zoneId, paymentId, customerId } = req.body;
        const transaction = await _prisma.default.transaction.create({
            data: {
                month,
                year,
                unit_old_date,
                unit_new_date,
                type,
                zoneId,
                paymentId,
                customerId
            }
        });
        let resultCal = {
            price: 0,
            over_due: 0,
            total_price: 0
        };
        if (transaction.type === "W") {
            resultCal.price = (transaction.unit_new_date - transaction.unit_old_date) * 16 + 50;
        } else if (transaction.type === "E") {
            let a = (transaction.unit_new_date - transaction.unit_old_date) * 7 + 50;
            let b = ((transaction.unit_new_date - transaction.unit_old_date) * 7 + 50) * 0.07;
            resultCal.price = a + b;
        }
        let previousMonth = String(Number(month) - 1);
        let previousYear = year;
        if (Number(month) === 1) {
            previousMonth = "12";
            previousYear = String(Number(year) - 1);
        } else if (previousMonth.length === 1) {
            previousMonth = "0" + previousMonth;
        }
        const overDueTransaction = await _prisma.default.transaction.findFirst({
            where: {
                month: previousMonth,
                year: previousYear,
                customerId: customerId
            },
            select: {
                CalculateTransactions: true
            },
            orderBy: {
                updateAt: "desc"
            }
        });
        if (overDueTransaction && overDueTransaction.CalculateTransactions) {
            resultCal.over_due = overDueTransaction.CalculateTransactions[0].total_price;
        }
        resultCal.total_price = Number(resultCal.price) + Number(resultCal.over_due);
        const calculateTransaction = await _prisma.default.calculateTransaction.create({
            data: {
                price: resultCal.price,
                over_due: resultCal.over_due,
                total_price: resultCal.total_price,
                transactionId: transaction.id
            }
        });
        res.status(201).json({
            message: "ok",
            transaction,
            calculateTransaction
        });
    } catch (error) {
        next(error);
    }
};
const getTransaction = async (req, res, next)=>{
    try {
        const result = await _prisma.default.transaction.findMany({
            include: {
                customer: true,
                CalculateTransactions: true
            },
            orderBy: {
                createAt: "desc"
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

//# sourceMappingURL=transaction-controller.js.map