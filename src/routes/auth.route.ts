import { getProfile, getUserAll, login, register, updateProfile, updateStatus } from '@/controllers/auth.controller';
import authMiddleware from '@/middlewares/authenticate';
import { Router } from 'express';

const router = Router();

router.post('/register', register);

router.post('/login', login);

router.get('/profile', authMiddleware, getProfile);

router.patch('/update/profile', authMiddleware, updateProfile);

router.patch('/update/status', authMiddleware, updateStatus);

router.get('/userAll', authMiddleware, getUserAll);

export default router;
