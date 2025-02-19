import { updateOrCreateTransaction, getAllTransaction, getByIdTransaction, payTransaction, updateById } from '@/controllers/transaction.controller';
import authMiddleware from '@/middlewares/authenticate';
import { Router } from 'express';

const router = Router();

router.get('/get-all', authMiddleware, getAllTransaction);

router.get('/getById', authMiddleware, getByIdTransaction);

router.put('/updateOrCreate', authMiddleware, updateOrCreateTransaction);

router.patch(`/update/:transactionId`, authMiddleware, updateById);

router.put('/pay', authMiddleware, payTransaction);

export default router;
