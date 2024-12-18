import { updateOrCreateTransaction, getAllTransaction, getByIdTransaction } from '@/controllers/transaction.controller';
import authMiddleware from '@/middlewares/authenticate';
import { Router } from 'express';

const router = Router();

router.get('/getAll', authMiddleware, getAllTransaction);

router.get('/getById', authMiddleware, getByIdTransaction);

router.put('/updateOrCreate', authMiddleware, updateOrCreateTransaction);

export default router;
