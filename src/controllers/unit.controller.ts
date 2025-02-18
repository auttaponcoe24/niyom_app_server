import prisma from '@/models/prisma';
import createError from '@/utils/create-error';
import { getAllUnitSchema, updateOrCreateUnitsSchema } from '@/validators/unit.validator';
import dayjs, { Dayjs } from 'dayjs';
import { NextFunction, Request, Response } from 'express';

export const getAllUnit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = getAllUnitSchema.safeParse(req.query);

    if (error) return next(createError(error.message, 400));

    const whereType = data.type === 'W' ? { isServiceWater: true } : data.type === 'E' ? { isServiceElectric: true } : '';

    const whereCustomer = {
      AND: [
        { zoneId: +data.zoneId },
        { id: { contains: data.customerId } },
        {
          OR: [{ firstName: { contains: data.keywords } }, { lastName: { contains: data.keywords } }],
        },
        { ...whereType },
      ],
    };
    const customer = await prisma.customer.findMany({
      take: +data.pageSize,
      skip: (+data.start - 1) * +data.pageSize,
      where: { ...whereCustomer },
      select: {
        id: true,
        no: true,
        firstName: true,
        lastName: true,
        houseNumber: true,
        isActive: true,
        isServiceWater: true,
        isServiceElectric: true,
        prefix: {
          select: {
            id: true,
            prefixName: true,
          },
        },
        zone: {
          select: {
            id: true,
            zoneName: true,
          },
        },
        units: {
          where: {
            date: new Date(dayjs(data.date).format('YYYY-MM-DD')),
            type: data.type,
          },
          select: {
            id: true,
            date: true,
            unitNumber: true,
            type: true,
          },
          orderBy: [
            {
              id: 'desc',
            },
            { type: 'asc' },
          ],
        },
      },
      orderBy: {
        no: 'asc',
      },
    });

    const total_record = await prisma.customer.count({
      where: whereCustomer,
    });

    const result = customer.map((cus, index: number) => {
      return cus.units.length === 0
        ? {
            id: 0,
            date: data.date,
            type: data.type,
            unitNumber: 0,
            customerId: cus.id,
            zoneId: +data.zoneId,

            // display
            no: cus.no,
            prefix: cus.prefix.prefixName ? cus.prefix.prefixName : '-',
            fullName: `${cus.firstName}  ${cus.lastName}`,
            houseNumber: cus.houseNumber,
          }
        : {
            id: cus.units[0].id,
            date: cus.units[0].date,
            type: cus.units[0].type,
            unitNumber: cus.units[0].unitNumber,
            customerId: cus.id,
            zoneId: cus.zone.id,

            // display
            no: cus.no,
            prefix: cus.prefix.prefixName ? cus.prefix.prefixName : '-',
            fullName: `${cus.firstName}  ${cus.lastName}`,
            houseNumber: cus.houseNumber,
          };
    });

    res.json({ status: true, message: 'ok', data: result, total_record });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

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
      const dateFormat = new Date(dayjs(item.date, 'YYYY-MM-DD').format('YYYY-MM-DD'));
      if (item.id !== 0) {
        // update existing record
        return await prisma.unit.update({
          where: {
            id: item.id,
          },
          data: {
            date: dateFormat,
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
