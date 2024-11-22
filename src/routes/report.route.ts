import { userReport } from '@/controllers/reports/user-report.controller';
import authMiddleware from '@/middlewares/authenticate';
import { Router } from 'express';

const router = Router();

router.post('/users', authMiddleware, userReport);

export default router;
