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
app.use(cors());
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
