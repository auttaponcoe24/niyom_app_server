import { z } from 'zod';
export const createZoneSchema = z.object({
  zoneName: z.string().min(1),
});

export const getAllZoneSchema = z.object({
  start: z.string().min(1, 'start is required'),
  pageSize: z.string().min(1, 'pageSize is required'),
  keywords: z.string().optional(),
});

export const getByIdZoneSchema = z.object({
  id: z.string().min(1),
});

export const updateZoneSchema = z.object({
  id: z.number().min(1),
  zoneName: z.string().min(1),
});

export const deleteZoneSchema = z.object({
  id: z.number().min(1),
});
