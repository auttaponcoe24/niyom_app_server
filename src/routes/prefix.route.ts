import { createPrefix, getAllPrefix } from '@/controllers/prefix.controller';
import authMiddleware from '@/middlewares/authenticate';
import { Router } from 'express';

const router = Router();

router.post('/create', authMiddleware, createPrefix);

router.get('/get-all', getAllPrefix);

export default router;
