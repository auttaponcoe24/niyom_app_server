import { createTransaction, getTransaction } from '@/controllers/transaction.controller';
import { Router } from 'express';

const router = Router();

router.post('/create', createTransaction);
router.get('/get', getTransaction);

export default router;
