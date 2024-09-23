import prisma from '@/models/prisma';
import createError from '@/utils/create-error';
import { getAllTransactionSchema } from '@/validators/transaction.validator';
import { NextFunction, Request, Response } from 'express';

export const getAllTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user.result;
    const { start, page_size, keywords, month, year, zoneId, type } = req.query;
    const { value, error } = getAllTransactionSchema.validate({ start, page_size, keywords, month, year, zoneId, type });

    if (error) {
      return next(createError(error.message, 404));
    }

    if (role !== 'ADMIN') {
      return next(createError('Is Not Admin', 404));
    }

    const customers = await prisma.customer.findMany({
      take: value.page_size,
      skip: (value.start - 1) * value.page_size,
      where: {
        AND: [
          { zoneId: value.zoneId },
          {
            OR: [
              { firstname: { contains: value.keywords } }, // Case-insensitive search
              { lastname: { contains: value.keywords } }, // Case-insensitive search
            ],
          },
        ],
      },
      include: {
        prefix: { select: { prefix_name: true } },
        transactions: {
          where: { month: value.month, year: value.year, type: value.type },
          select: {
            id: true,
            month: true,
            year: true,
            type: true,
            unit_new_id: true,
            unit_new: true,
            unit_old_id: true,
            unit_old: true,
            unit_used: true,
            amount: true,
            over_due: true,
            total_price: true,
            status: true,
            zoneId: true,
            customerId: true,
          },
        },
      },
    });

    // ใช้ for...of เพื่อรองรับ async/await
    for (const customer of customers) {
      // customers.map(async customer => {
      const unitNewDate = await prisma.unit.findFirst({
        where: {
          month: value.month,
          year: value.year,
          customerId: customer.id,
          type: value.type,
        },
        select: {
          id: true,
          month: true,
          year: true,
          type: true,
          unit_number: true,
        },
      });

      const unitOldDate = await prisma.unit.findFirst({
        where: {
          month: value.month === '1' ? '12' : String(Number(value.month) - 1),
          year: value.month === '1' ? String(Number(value.year) - 1) : value.year,
          customerId: customer.id,
          type: value.type,
        },
        select: {
          id: true,
          month: true,
          year: true,
          type: true,
          unit_number: true,
        },
      });

      const previousTransaction = await prisma.transaction.findFirst({
        where: {
          month: value.month === '1' ? '12' : String(Number(value.month) - 1),
          year: value.month === '1' ? String(Number(value.year) - 1) : value.year,
          customerId: customer.id,
          type: value.type,
        },
        select: {
          total_price: true,
        },
      });

      // Handle case when no previous unit data is available
      const unitUsed = Number(unitNewDate?.unit_number || 0) - Number(unitOldDate?.unit_number || 0);
      const amount = value.type === 'W' ? unitUsed * 16 + 50 : unitUsed * 7 + 50 * 0.07;
      const totalPrice = amount + Number(previousTransaction?.total_price ?? 0);

      // If no transactions exist, create a new one
      if (customer.transactions.length === 0) {
        customer.transactions.push({
          id: 0,
          month: value.month,
          year: value.year,
          type: value.type,
          unit_new_id: unitNewDate?.id,
          unit_new: unitNewDate as any,
          unit_old_id: unitOldDate?.id ?? null,
          unit_old: unitOldDate as any,
          unit_used: unitUsed || 0, // Ensure unitUsed is not null
          amount: amount,
          over_due: previousTransaction?.total_price ?? 0,
          total_price: totalPrice,
          status: 'PENDING',
          zoneId: value.zoneId,
          customerId: customer.id,
        });
      }
    }

    const result = customers.filter(customer => !!customer.transactions[0].unit_old_id && !!customer.transactions[0].unit_new_id);

    res.status(200).json({ message: 'ok', customers: result, total_record: result?.length });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

export const updateOrCreateTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user.result;
    const value = req.body;

    if (role !== 'ADMIN') {
      return next(createError('Is not Admin', 400));
    }

    const operations = value.map(async item => {
      if (item.id !== 0) {
        return await prisma.transaction.update({
          where: {
            id: item.id,
          },
          data: {
            month: item.month,
            year: item.year,
            type: item.type,
            unit_new_id: item.unit_new_id,
            unit_old_id: item.unit_old_id,
            unit_used: item.unit_used,
            amount: item.amount,
            over_due: item.over_due,
            total_price: item.total_price,
            status: item.status,
            zoneId: item.zoneId,
            customerId: item.customerId,
          },
        });
      } else if (item.id === 0) {
        return await prisma.transaction.create({
          data: {
            month: item.month,
            year: item.year,
            type: item.type,
            unit_new_id: item.unit_new_id,
            unit_old_id: item.unit_old_id,
            unit_used: item.unit_used,
            amount: item.amount,
            over_due: item.over_due,
            total_price: item.total_price,
            status: item.status,
            zoneId: item.zoneId,
            customerId: item.customerId,
          },
        });
      }
    });

    const results = await Promise.all(operations);

    res.status(201).json({ message: 'ok', result: results });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
