import { createCustomer, deleteCustomer, getAllCustomer, getByIdCustomer, updateCustomer } from '@/controllers/customer.controller';
import authMiddleware from '@/middlewares/authenticate';
import { Router } from 'express';

const router = Router();

router.post('/create', authMiddleware, createCustomer);
router.get('/getAll', authMiddleware, getAllCustomer);
router.get('/getById', authMiddleware, getByIdCustomer);
router.patch('/update', authMiddleware, updateCustomer);
router.delete('/delete', authMiddleware, deleteCustomer);

export default router;
