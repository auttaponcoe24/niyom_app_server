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
const _authcontroller = require("../controllers/auth-controller");
const _authenticate = _interop_require_default(require("../middlewares/authenticate"));
const _express = require("express");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const router = (0, _express.Router)();
router.post('/sign-up', _authcontroller.register);
router.post('/sign-in', _authcontroller.login);
router.get('/profile', _authenticate.default, _authcontroller.getProfile);
router.patch('/editProfile', _authenticate.default, _authcontroller.editProfile);
router.patch('/update-access', _authenticate.default, _authcontroller.updateAccess);
const _default = router;

//# sourceMappingURL=auth-route.js.map