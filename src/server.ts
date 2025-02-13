import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';

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

app.get('/', async (req: Request, res: Response) => {
  const test: string = 'Hello world';
  res.status(200).json({ message: test });
});

app.use('/api/auth', authRoute);
app.use('/api/zone', zoneRoute);
app.use('/api/prefix', prefixRoute);
app.use('/api/customer', customerRoute);
app.use('/api/transaction', transactionRoute);
app.use('/api/unit', unitRoute);

app.use(notFoundMiddlewares);
app.use(errorMiddlewares);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => console.log(`Server is run on PORT: ${PORT}`));
