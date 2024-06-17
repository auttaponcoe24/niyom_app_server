import { getProfile, login, register } from "@/controllers/auth-controller";
import authMiddleware from "@/middlewares/authenticate";
import { Router } from "express";

const router = Router();

router.post("/sign-up", register);

router.post("sign-in", login);

router.get("profile", authMiddleware, getProfile);

export default router;
