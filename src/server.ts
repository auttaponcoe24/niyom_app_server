import cors from 'cors';
import dayjs from 'dayjs';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import morgan from 'morgan';
import path from 'path';

// Middlewares
import errorMiddlewares from '@/middlewares/error';
import notFoundMiddlewares from '@/middlewares/not-found';

// Routes
import authRoute from '@/routes/auth.route';
import customerRoute from '@/routes/customer.route';
import prefixRoute from '@/routes/prefix.route';
import reportRoute from '@/routes/report.route';
import transactionRoute from '@/routes/transaction.route';
import unitRoute from '@/routes/unit.route';
import zoneRoute from '@/routes/zone.route';

import 'dayjs/locale/th'; // ติดตั้ง locale ภาษาไทย
import buddhistEra from 'dayjs/plugin/buddhistEra';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(customParseFormat);
dayjs.extend(buddhistEra);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Bangkok');
dayjs.locale('th');

dotenv.config();
const app = express();

app.use(
  cors({
    origin: process.env.ENABLE_CORS_DOMAIN?.split(','),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // อนุญาต HTTP methods
    allowedHeaders: 'Content-Type, Authorization, Accept-Language, referrer-policy', // เพิ่ม referrer-policy
    credentials: true, // อนุญาตให้ส่ง Cookie มาด้วย
    preflightContinue: false, // ป้องกันไม่ให้ preflight request ถูกส่งออกไปที่เซิร์ฟเวอร์อื่น
  }),
);
app.use(morgan('dev'));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// ให้ Express เสิร์ฟไฟล์จากโฟลเดอร์ "public"
app.use('/public', express.static(path.join(__dirname, '../public')));

app.get('/', async (_req: Request, res: Response) => {
  const test: string = 'Hello world111';
  res.status(200).json({ message: test });
});

app.use('/api/auth', authRoute);
app.use('/api/zone', zoneRoute);
app.use('/api/prefix', prefixRoute);
app.use('/api/customer', customerRoute);
app.use('/api/unit', unitRoute);
app.use('/api/transaction', transactionRoute);
app.use('/api/report', reportRoute);

app.use(notFoundMiddlewares);
app.use(errorMiddlewares);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => console.log(`Server is run on PORT: ${PORT}`));
