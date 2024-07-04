import { createZone, getZone } from '@/controllers/zone.controller';
import authMiddleware from '@/middlewares/authenticate';
import { Router } from 'express';

const router = Router();

router.post('/create', authMiddleware, createZone);

router.get('/getAll', authMiddleware, getZone);

export default router;
