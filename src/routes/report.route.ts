import { receiptReport, transactionReport, userReport } from '@/controllers/reports/user-report.controller';
import authMiddleware from '@/middlewares/authenticate';
import { Router } from 'express';

const router = Router();

router.post('/users', authMiddleware, userReport);

router.post('/transaction', authMiddleware, transactionReport);

router.post('/receipt', authMiddleware, receiptReport);

export default router;
