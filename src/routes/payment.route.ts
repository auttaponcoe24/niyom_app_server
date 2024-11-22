import { createPayment, getAllPayment } from '@/controllers/payment.controller';
import uploadMiddleware from '@/middlewares/upload';
import { Router } from 'express';

const router = Router();

router.post('create', uploadMiddleware.single('imgSlip'), createPayment);

router.get('getAll', getAllPayment);

export default router;
