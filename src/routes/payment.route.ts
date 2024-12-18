import { createPayment, getAllPayment, updatePayment } from '@/controllers/payment.controller';
import authMiddleware from '@/middlewares/authenticate';
import uploadMiddleware from '@/middlewares/upload';
import { Router } from 'express';

const router = Router();

router.post('/create/:folder', authMiddleware, uploadMiddleware.single('imgSlip'), createPayment);

router.put('/updatePay', authMiddleware, updatePayment);

router.get('/getAll', getAllPayment);

export default router;
