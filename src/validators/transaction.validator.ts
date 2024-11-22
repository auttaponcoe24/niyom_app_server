import { z } from 'zod';

export const getAllTransactionSchema = z.object({
  start: z.string({
    required_error: 'start is required',
  }),
  page_size: z.string({
    required_error: 'page_size is required',
  }),
  keywords: z.string().optional(),
  date: z.string({
    required_error: 'date is required',
  }),
  // month: z.string({
  //   required_error: 'month is required',
  // }),
  // year: z.string({
  //   required_error: 'year is required',
  // }),
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
  month: z.string().optional(),
  year: z.string().optional(),
  type: z.enum(['W', 'E'], {
    message: 'Type must be either W or E',
  }),
  unitOldId: z.number().optional(),
  unitNewId: z.number().optional(),
  unitUsed: z.number().optional(),
  amount: z.number().optional(),
  overDue: z.number().optional(),
  totalPrice: z.number().optional(),
  status: z.enum(['PENDING', 'REJECT', 'SUCCESS']),
  zoneId: z.number().optional(),
  customerId: z.string().optional(),
});

export const createTransactionsSchema = z.array(createTransactionSchema);
