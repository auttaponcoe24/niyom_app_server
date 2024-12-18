import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dayjs from 'dayjs';
import path from 'path';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/th'; // ติดตั้ง locale ภาษาไทย

// Middlewares
import errorMiddlewares from '@/middlewares/error';
import notFoundMiddlewares from '@/middlewares/not-found';

// Routes
import authRoute from '@/routes/auth.route';
import customerRoute from '@/routes/customer.route';
import zoneRoute from '@/routes/zone.route';
import transactionRoute from '@/routes/transaction.route';
import unitRoute from '@/routes/unit.route';
import prefixRoute from '@/routes/prefix.route';
import reportRoute from '@/routes/report.route';
import paymentRoute from '@/routes/payment.route';

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
app.use(cors());
app.use(morgan('dev'));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// ให้ Express เสิร์ฟไฟล์จากโฟลเดอร์ "public"
app.use('/public', express.static(path.join(__dirname, '../public')));

app.get('/', async (req: Request, res: Response) => {
  const test: string = 'Hello world';
  res.json({ message: test });
});

app.use('/zone', zoneRoute);
app.use('/prefix', prefixRoute);
app.use('/auth', authRoute);
app.use('/customer', customerRoute);
app.use('/unit', unitRoute);
app.use('/transaction', transactionRoute);
app.use('/payment', paymentRoute);
app.use('/report', reportRoute);

app.use(notFoundMiddlewares);
app.use(errorMiddlewares);

const PORT = process.env.PORT || '3000';
app.listen(PORT, () => console.log(`Server is run on PORT: ${PORT}`));
