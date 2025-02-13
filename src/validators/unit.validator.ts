import * as z from 'zod';
export const getAllUnitSchema = z.object({
  start: z.string().min(1),
  pageSize: z.string().min(1),
  keywords: z.string().optional(),
  customerId: z.string().optional(),
  date: z.string().min(1),
  zoneId: z.string().min(1),
  type: z.enum(['W', 'E'], {
    message: 'Type must be either W or E',
  }),
});

export const updateOrCreateUnitSchema = z.object({
  id: z.number(),
  date: z.string(),
  type: z.enum(['W', 'E'], {
    message: 'Type must be either W or E',
  }),
  unitNumber: z.number(),
  customerId: z.string().min(1, 'Customer ID is required'),
  zoneId: z.number(),
});

// สำหรับ array ของ units
export const updateOrCreateUnitsSchema = z.array(updateOrCreateUnitSchema);
