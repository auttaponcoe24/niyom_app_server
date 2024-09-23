import prisma from '@/models/prisma';
import createError from '@/utils/create-error';
import { getAllUnitSchema } from '@/validators/unit.validator';
import dayjs from 'dayjs';
import { NextFunction, Request, Response } from 'express';

export const getAllUnit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { start, page_size, keywords, month, year, zoneId, type } = req.query;
    const { value, error } = getAllUnitSchema.validate({ start, page_size, keywords, month, year, zoneId, type });

    if (error) return next(createError(error.message, 404));

    const customer = await prisma.customer.findMany({
      take: value.page_size,
      skip: (value.start - 1) * value.page_size,
      where: {
        AND: [
          { zoneId: value.zoneId },
          {
            OR: [{ firstname: { contains: value.keywords } }, { lastname: { contains: value.keywords } }],
          },
        ],
      },
      include: {
        prefix: true,

        units: {
          where: {
            AND: [
              {
                month: value.month,
              },
              {
                year: value.year,
              },
              {
                type: value.type,
              },
            ],
          },
          orderBy: {
            createAt: 'desc',
          },
        },
      },
    });

    const total_record = await prisma.customer.count();

    customer.map(item => {
      if (item.units.length === 0) {
        item.units.push({
          id: 0,
          month: value.month,
          year: value.year,
          unit_number: 0,
          type: value.type,
          customerId: item.id,
          createAt: dayjs().toDate(),
          updateAt: null,
        });
      }

      return item;
    });

    res.json({ message: 'ok', result: customer, total_record: total_record });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

export const updateOrCreateUnit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user.result;
    const values = req.body;

    if (role !== 'ADMIN') {
      return next(createError('Not Admin', 401));
    }

    const operations = values.map(async item => {
      if (item.id !== 0) {
        // update existing record
        return await prisma.unit.update({
          where: {
            id: item.id,
          },
          data: {
            month: item.month,
            year: item.year,
            unit_number: Number(item.unit_number),
            type: item.type,
            customerId: item.customerId,
          },
        });
      } else {
        // create new record
        return await prisma.unit.create({
          data: {
            month: item.month,
            year: item.year,
            unit_number: Number(item.unit_number),
            type: item.type,
            customerId: item.customerId,
          },
        });
      }
    });

    // console.log('values=>', values);
    // console.log('operations=>', operations);

    const results = await Promise.all(operations);
    res.status(201).json({ message: 'ok', result: results });
  } catch (error) {
    console.error(error);
  }
};
