import { getAllUnit, updateOrCreateUnit } from '@/controllers/unit.controller';
import authMiddleware from '@/middlewares/authenticate';
import { Router } from 'express';

const router = Router();

router.get('/getAll', authMiddleware, getAllUnit);

router.put('/updateOrCreate', authMiddleware, updateOrCreateUnit);

export default router;
