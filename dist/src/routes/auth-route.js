import { register } from "@/controllers/auth-controller";
import { Router } from "express";
var router = Router();
router.post("/sign-up", register);
export default router;

//# sourceMappingURL=auth-route.js.map