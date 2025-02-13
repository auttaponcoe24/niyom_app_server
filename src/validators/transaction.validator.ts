import { z } from 'zod';

export const getAllTransactionSchema = z.object({
  start: z.string({
    required_error: 'start is required',
  }),
  pageSize: z.string({
    required_error: 'page_size is required',
  }),
  keywords: z.string().optional(),
  customerId: z.string().optional(),
  date: z.string({
    required_error: 'date is required',
  }),
  zoneId: z.string({
    required_error: 'start is required',
  }),
  type: z.enum(['W', 'E'], {
    message: 'Type must be either W or E',
  }),
});

export const createTransactionSchema = z.object({
  id: z.number(),
  date: z.string(),
  type: z.enum(['W', 'E'], {
    message: 'Type must be either W or E',
  }),
  unitOldId: z.number().optional(),
  unitNewId: z.number().optional(),
  unitUsed: z.number().optional(),
  amount: z.number().optional(),
  overDue: z.number().optional(),
  pay: z.number().optional(),
  total: z.number().optional(),
  status: z.enum(['WAITING', 'PAY']),
  customerId: z.string().optional(),
  zoneId: z.number().optional(),
});

export const createTransactionsSchema = z.array(createTransactionSchema);
