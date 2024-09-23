import { createZone, deleteZone, getAllZone, getByIdZone, updateZone } from '@/controllers/zone.controller';
import authMiddleware from '@/middlewares/authenticate';
import { Router } from 'express';

const router = Router();

router.post('/create', authMiddleware, createZone);

router.get('/getAll', authMiddleware, getAllZone);

router.get('/getById', authMiddleware, getByIdZone);

router.patch('/update', authMiddleware, updateZone);

router.delete('/delete', authMiddleware, deleteZone);

export default router;
