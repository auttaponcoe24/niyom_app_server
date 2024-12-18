import prisma from '@/models/prisma';
import createError from '@/utils/create-error';
import { ResponseSuccess } from '@/utils/handleResponse';
import { createPaymentSchema, getAllPaymentSchema, updatePaymentSchema } from '@/validators/payment.validator';
import dayjs from 'dayjs';
import { NextFunction, Request, Response } from 'express';

export const createPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: userId } = req.user.data;
    const { folder } = req.params;

    let filePath = '';
    const { data, error } = createPaymentSchema.safeParse(req.body);

    console.log(data);

    if (error) return next(createError(error.message, 401));

    if (!req.file) return next(createError('Slip is not found', 500));

    if (req.file) {
      filePath = `public/images/${folder}/${req.file.filename}`;
    }

    const dateFormat = new Date(dayjs(data.date).format('YYYY-MM-DD'));

    const findTransactionId = await prisma.transaction.findUnique({
      where: {
        id: +data.transactionId,
      },
    });

    if (!findTransactionId) return createError('TransactionId is not found', 400);

    const result = await prisma.payment.create({
      data: {
        date: dateFormat,
        imgSlip: filePath,
        amount: +data.amount,
        transactionId: +data.transactionId,
        status: 'PENDING',
        userId: userId,
      },
    });

    // res.status(201).json({ message: 'ok', data: result });
    res.status(201).json(ResponseSuccess(result));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const updatePayment = async (req: Request, res: Response, next: NextFunction) => {
  const { role, firstName, lastName } = req.user.data;
  const shortFullName = `${firstName} ${lastName}`;
  try {
    const { data, error } = updatePaymentSchema.safeParse(req.body);

    if (error) return createError(error.message, 500);

    if (role !== 'ADMIN') return createError('Is not admin', 500);

    const findPayment = await prisma.payment.findUnique({
      where: {
        id: data.id,
      },
      select: {
        id: true,
        transaction: {
          select: {
            totalPrice: true,
          },
        },
      },
    });

    if (!findPayment) return createError('PaymentId is not found', 400);

    const newTotalPrice = findPayment.transaction.totalPrice - data.pay;

    const result = await prisma.payment.update({
      where: {
        id: findPayment.id,
      },
      data: {
        status: data.status,
        approveby: shortFullName,
        transaction: {
          update: {
            status: data.status,
            totalPrice: newTotalPrice,
          },
        },
      },
    });

    // res.status(201).json({ status: 'success', data: result });
    res.status(201).json(ResponseSuccess(result));
  } catch (error) {
    console.error(error);
  }
};

export const getAllPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = getAllPaymentSchema.safeParse(req.query);

    if (error) return next(createError(error.message, 400));

    const dateFormat = new Date(dayjs(data.date).format('YYYY-MM-DD'));

    const result = await prisma.payment.findMany({
      take: +data.page_size,
      skip: (+data.start - 1) * +data.page_size,
      where: {
        transaction: {
          customerId: {
            contains: data.customerId,
          },
        },
        status: data.status,
        date: dateFormat,
      },
      select: {
        id: true,
        date: true,
        imgSlip: true,
        amount: true,
        status: true,
        transactionId: true,
        transaction: {
          select: {
            id: true,
            date: true,
            month: true,
            year: true,
            type: true,
            unitOld: {
              select: {
                id: true,
                unitNumber: true,
              },
            },
            unitNew: {
              select: {
                id: true,
                unitNumber: true,
              },
            },
            unitUsed: true,
            amount: true,
            overDue: true,
            totalPrice: true,
            status: true,
            customerId: true,
          },
        },
      },
    });

    // res.status(200).json({ data: result });
    res.status(200).json(ResponseSuccess(result));
  } catch (error) {
    console.error(error);
    next(error);
  }
};
