import * as z from 'zod';

export const createPaymentSchema = z.object({
  date: z.string(),
  // imgSlip: z.string(),
  amount: z.string(),
  transactionId: z.string(),
  // userId: z.string(),
});

export const getAllPaymentSchema = z.object({
  start: z.string(),
  page_size: z.string(),
  customerId: z.string(),
  status: z.enum(['PENDING', 'REJECT', 'SUCCESS']),
  date: z.string(),
});

export const updatePaymentSchema = z.object({
  id: z.number(),
  status: z.enum(['PENDING', 'REJECT', 'SUCCESS']),
  // approveBy: z.string(),
  pay: z.number(),
});
