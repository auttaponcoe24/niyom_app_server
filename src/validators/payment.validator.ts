import * as z from 'zod';

export const createPaymentSchema = z.object({
  date: z.date(),
  imgSlip: z.string(),
  amount: z.number(),
  transactionId: z.number(),
  status: z.enum(['PENDING', 'REJECT', 'SUCCESS']),
  userId: z.string(),
  approveby: z.string(),
});

export const getAllPaymentSchema = z.object({
  start: z.number(),
  page_size: z.number(),
  customerId: z.string(),
});
