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
const _customercontroller = require("../controllers/customer-controller");
const _authenticate = _interop_require_default(require("../middlewares/authenticate"));
const _express = require("express");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const router = (0, _express.Router)();
router.post("/create", _authenticate.default, _customercontroller.createCustomer);
router.get("/getAll", _authenticate.default, _customercontroller.getAllCustomer);
router.patch("/edit", _authenticate.default, _customercontroller.editCustomer);
const _default = router;

//# sourceMappingURL=customer-route.js.map