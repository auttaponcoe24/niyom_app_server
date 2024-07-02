"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _dotenv = _interop_require_default(require("dotenv"));
const _express = _interop_require_default(require("express"));
const _cors = _interop_require_default(require("cors"));
const _morgan = _interop_require_default(require("morgan"));
const _error = _interop_require_default(require("./middlewares/error"));
const _notfound = _interop_require_default(require("./middlewares/not-found"));
const _authroute = _interop_require_default(require("./routes/auth-route"));
const _customerroute = _interop_require_default(require("./routes/customer-route"));
const _zoneroute = _interop_require_default(require("./routes/zone-route"));
const _transactionroute = _interop_require_default(require("./routes/transaction-route"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
_dotenv.default.config();
const app = (0, _express.default)();
app.use((0, _cors.default)());
app.use((0, _morgan.default)('dev'));
app.use(_express.default.json());
app.get('/', (req, res)=>{
    const test = 'Hello world';
    res.json({
        message: test
    });
});
app.use('/auth', _authroute.default);
app.use('/customer', _customerroute.default);
app.use('/zone', _zoneroute.default);
app.use('/transaction', _transactionroute.default);
app.use(_notfound.default);
app.use(_error.default);
const PORT = process.env.PORT || '8800';
app.listen(PORT, ()=>console.log(`Server is run on PORT: ${PORT}`));

//# sourceMappingURL=server.js.map