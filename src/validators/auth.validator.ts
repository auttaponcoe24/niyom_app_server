import { z } from 'zod';

export const registerSchema = z
  .object({
    firstName: z.string({
      required_error: 'Firstname is required',
    }),
    lastName: z.string().optional(),
    cardId: z.string().length(13, 'Card Id must be exactily 13 characters long').min(1, { message: 'Card Id is required' }),
    email: z.string().email('Email must be a valid email addess').min(1, { message: 'Email is required' }),
    password: z.string().min(8, 'Password must be at least 8 characters long').min(1, { message: 'Password is required' }),
    confirmPassword: z.string().min(1, { message: 'Confirm password is required' }),
  })
  .superRefine((data, ctx) => {
    if (data.confirmPassword !== data.password) {
      ctx.addIssue({
        code: 'custom', // กำหนด code เป็น "custom"
        path: ['confirmPassword'], // ระบุ field ที่มีข้อผิดพลาด
        message: 'Passwords do not match', // ข้อความแสดงปัญหา
      });
    }
  });

export const loginSchema = z.object({
  emailOrCardId: z.union([z.string().email('Must be a valid email address'), z.string().length(13, 'Card ID must be exactily 13 characters long')]), // ใช้ z.union หากต้องการแยก validation ระหว่าง email และ card_id ชัดเจน
  password: z.string().min(8, 'Password must be at least 8 characters long').min(1, { message: 'Password is required' }),
});
