import { createCustomer, deleteCustomer, getAllCustomer, getByIdCustomer, updateCustomer, uploadProfile } from '@/controllers/customer.controller';
import authMiddleware from '@/middlewares/authenticate';
import uploadMiddleware from '@/middlewares/upload';
import { Router } from 'express';

const router = Router();

router.post('/create', authMiddleware, createCustomer);

router.get('/getAll', authMiddleware, getAllCustomer);

router.get('/getById', authMiddleware, getByIdCustomer);

router.patch('/update', authMiddleware, updateCustomer);

router.delete('/delete', authMiddleware, deleteCustomer);

router.put('/uploadProfile/:folder', authMiddleware, uploadMiddleware.single('imgProfile'), uploadProfile);

export default router;
