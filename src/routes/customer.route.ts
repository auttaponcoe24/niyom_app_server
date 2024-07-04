import { createCustomer, editCustomer, getAllCustomer } from '@/controllers/customer.controller';
import authMiddleware from '@/middlewares/authenticate';
import { Router } from 'express';

const router = Router();

router.post('/create', authMiddleware, createCustomer);
router.get('/getAll', authMiddleware, getAllCustomer);
router.patch('/edit', authMiddleware, editCustomer);

export default router;
