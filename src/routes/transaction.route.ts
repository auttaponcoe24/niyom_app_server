import { updateOrCreateTransaction, getAllTransaction } from '@/controllers/transaction.controller';
import authMiddleware from '@/middlewares/authenticate';
import { Router } from 'express';

const router = Router();

router.get('/getAll', authMiddleware, getAllTransaction);

router.put('/updateOrCreate', authMiddleware, updateOrCreateTransaction);

export default router;
