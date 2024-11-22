import prisma from '@/models/prisma';
import createError from '@/utils/create-error';
import { getAllUnitSchema, updateOrCreateUnitsSchema } from '@/validators/unit.validator';
import dayjs, { Dayjs } from 'dayjs';
import { NextFunction, Request, Response } from 'express';

export const getAllUnit = async (req: Request, res: Response, next: NextFunction) => {
  // const mm = String(reportFilter.month).padStart(2, '0');
  try {
    const { data, error } = getAllUnitSchema.safeParse(req.query);

    if (error) return next(createError(error.message, 400));

    const year = dayjs(data.date, 'YYYY-MM').format('YYYY');
    const month = dayjs(data.date, 'YYYY-MM').format('M');

    // console.log('year', year);
    // console.log('month', month);

    const whereCustomer = {
      AND: [
        { zoneId: +data.zoneId },
        {
          OR: [{ firstName: { contains: data.keywords } }, { lastName: { contains: data.keywords } }],
        },
      ],
    };
    const customer = await prisma.customer.findMany({
      take: +data.page_size,
      skip: (+data.start - 1) * +data.page_size,
      where: whereCustomer,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        houseNumber: true,
        prefixId: true,
        prefix: {
          select: {
            prefixName: true,
          },
        },
        zoneId: true,
        zone: {
          select: {
            zoneName: true,
          },
        },
        units: {
          where: {
            AND: [
              {
                month: month,
              },
              {
                year: year,
              },
              {
                type: data.type,
              },
            ],
          },
          select: {
            id: true,
            date: true,
            month: true,
            year: true,
            unitNumber: true,
            type: true,
            customerId: true,
            zoneId: true,
          },
          orderBy: {
            id: 'desc',
          },
        },
      },
    });

    const total_record = await prisma.customer.count({
      where: whereCustomer,
    });

    const result = customer.map((item, index: number) => {
      return item.units.length === 0
        ? {
            id: 0,
            date: data.date,
            month: month,
            year: year,
            unitNumber: 0,
            type: data.type,
            customerId: item.id,
            zoneId: +data.zoneId,

            no: index + 1,
            prefix: item.prefix.prefixName ? item.prefix.prefixName : '-',
            fullname: `${item.firstName}  ${item.lastName}`,
            houseNumber: item.houseNumber,
            zoneName: item.zone.zoneName,
          }
        : {
            id: item.units[0].id,
            date: item.units[0].date,
            month: item.units[0].month,
            year: item.units[0].year,
            unitNumber: item.units[0].unitNumber,
            type: item.units[0].type,
            customerId: item.units[0].customerId,
            zoneId: +item.units[0].zoneId,

            no: index + 1,
            prefix: item.prefix.prefixName ? item.prefix.prefixName : '-',
            fullname: `${item.firstName}  ${item.lastName}`,
            houseNumber: item.houseNumber,
            zoneName: item.zone.zoneName,
          };
    });

    res.json({ message: 'ok', data: result, total_record });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

// interface IUpdateOrCreateUnit {
//   id: number;
//   date: Date;
//   month: string;
//   year: string;
//   type: 'W' | 'E';
//   unitNumber: number;
//   customerId: string;
//   zoneId: number;
// }

export const updateOrCreateUnit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user.data;
    // const data = req.body as IUpdateOrCreateUnit[];
    const { data, error } = updateOrCreateUnitsSchema.safeParse(req.body);

    if (error) return next(createError(error.message, 401));

    if (role !== 'ADMIN') {
      return next(createError('Not Admin', 401));
    }

    const operations = data.map(async item => {
      const dateFormat = new Date(dayjs(item.date, 'YYYY-MM').format('YYYY-MM'));
      if (item.id !== 0) {
        // update existing record
        return await prisma.unit.update({
          where: {
            id: item.id,
          },
          data: {
            date: dateFormat,
            month: item.month,
            year: item.year,
            unitNumber: item.unitNumber,
            type: item.type,
            customerId: item.customerId,
            zoneId: item.zoneId,
          },
        });
      } else {
        // create new record
        return await prisma.unit.create({
          data: {
            date: dateFormat,
            month: item.month,
            year: item.year,
            unitNumber: Number(item.unitNumber),
            type: item.type,
            customerId: item.customerId,
            zoneId: item.zoneId,
          },
        });
      }
    });

    // console.log('values=>', values);
    // console.log('operations=>', operations);

    const results = await Promise.all(operations);
    res.status(201).json({ message: 'ok', data: results });
  } catch (error) {
    console.error(error);
  }
};
