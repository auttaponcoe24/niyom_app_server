import { Router } from "express";
import { register } from "@/controllers/auth-controller";

const router = Router();

router.post("/sign-up", register);

export default router;
