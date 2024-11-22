import prisma from '@/models/prisma';
import createError from '@/utils/create-error';
import { createPaymentSchema, getAllPaymentSchema } from '@/validators/payment.validator';
import { NextFunction, Request, Response } from 'express';

export const createPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = createPaymentSchema.safeParse(req.body);

    if (error) return next(createError(error.message, 401));

    if (!req.files) return next(createError('Slip is not found', 401));

    if (req.file) {
      data.imgSlip = `image/slip/${req.file.filename}`;
    }

    const result = await prisma.payment.create({
      data: {
        date: data.date,
        imgSlip: data.imgSlip,
        amount: data.amount,
        transactionId: data.transactionId,
        status: data.status,
        userId: data.userId,
        approveby: data.approveby,
      },
    });

    res.status(201).json({ message: 'ok', data: result });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const getAllPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = getAllPaymentSchema.safeParse(req.query);

    if (error) return next(createError(error.message, 400));

    const result = await prisma.payment.findMany({
      take: data.page_size,
      skip: data.start - 1 * data.page_size,
      where: {
        transaction: {
          customerId: {
            contains: data.customerId,
          },
        },
      },
      select: {
        transaction: true,
      },
    });

    res.status(200).json({ messages: 'ok', data: result });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
