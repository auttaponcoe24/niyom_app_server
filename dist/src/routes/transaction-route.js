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
const _transactioncontroller = require("../controllers/transaction-controller");
const _express = require("express");
const router = (0, _express.Router)();
router.post("/create", _transactioncontroller.createTransaction);
router.get("/get", _transactioncontroller.getTransaction);
const _default = router;

//# sourceMappingURL=transaction-route.js.map