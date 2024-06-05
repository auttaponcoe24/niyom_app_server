import { register } from "@/controllers/auth-controller";
import { Router } from "express";

const router = Router();

router.post("/sign-up", register);

export default router;
