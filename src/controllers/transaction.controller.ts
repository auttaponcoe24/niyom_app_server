import prisma from '@/models/prisma';
import createError from '@/utils/create-error';
import { ResponseSuccess } from '@/utils/handleResponse';
import { createTransactionsSchema, getAllTransactionSchema } from '@/validators/transaction.validator';
import dayjs from 'dayjs';
import { NextFunction, Request, Response } from 'express';

export const getAllTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user.data;
    const { data, error } = getAllTransactionSchema.safeParse(req.query);

    if (error) {
      return next(createError(error.message, 404));
    }

    if (role !== 'ADMIN') {
      return next(createError('Is Not Admin', 404));
    }

    const currentDate = new Date(dayjs(data.date, 'YYYY-MM').startOf('month').format('YYYY-MM-DD'));
    const beforeDate = new Date(
      dayjs(data.date, 'YYYY-MM')
        .startOf('month') // ไปที่วันที่ 1 ของเดือน
        .subtract(1, 'month') // เลื่อนเดือนก่อนหน้า
        .format('YYYY-MM-DD'), // แปลงเป็นรูปแบบ 'YYYY-MM-DD'
    );

    // console.log('currentDate', currentDate);
    // console.log('beforeDate', beforeDate);
    const year = dayjs(data.date, 'YYYY-MM').format('YYYY');
    const month = dayjs(data.date, 'YYYY-MM').format('M');

    const whereCustomer = {
      zoneId: +data.zoneId,
      OR: [
        {
          firstName: {
            contains: String(data.keywords),
          },
        },
        {
          lastName: {
            contains: String(data.keywords),
          },
        },
        {
          id: {
            contains: String(data.keywords),
          },
        },
      ],
    };

    const customers = await prisma.customer.findMany({
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
            date: {
              gte: beforeDate,
              lte: currentDate,
            },
            type: data.type,
          },
          select: {
            id: true,
            date: true,
            month: true,
            year: true,
            type: true,
            unitNumber: true,
            customerId: true,
            zoneId: true,
          },
          orderBy: [{ date: 'asc' }],
        },
        transactions: {
          where: {
            month,
            year,
            type: data.type,
          },
          select: {
            id: true,
            date: true,
            month: true,
            year: true,
            type: true,
            unitOldId: true,
            unitOld: {
              select: {
                id: true,
                date: true,
                unitNumber: true,
              },
            },
            unitNewId: true,
            unitNew: {
              select: {
                id: true,
                date: true,

                unitNumber: true,
              },
            },
            unitUsed: true,
            amount: true,
            overDue: true,
            totalPrice: true,
            status: true,
            customerId: true,
            zoneId: true,
          },
          orderBy: [{ id: 'desc' }],
        },
      },
    });

    const total_record = await prisma.customer.count({
      where: whereCustomer,
    });

    const findTransactionBefore = await prisma.transaction.findMany({
      where: {
        date: {
          lte: beforeDate,
        },
        type: data.type,
      },
    });

    const result = customers.map((cus, index: number) => {
      // สูตรค่าน้ำ unitUsed * 16 + 50 และ ค่าไฟ unitUsed * 7 + 50 * 0.07
      const unitUsed = cus?.units[1]?.unitNumber ?? 0 - cus?.units[0]?.unitNumber ?? 0;
      const amount = data.type === 'W' ? unitUsed * 16 + 50 : unitUsed * 7 + 50 * 0.07;

      const tranEmpBefore = findTransactionBefore.find(item => item.customerId === cus.id);

      return cus.transactions.length === 0
        ? {
            id: 0,
            date: currentDate,
            month: month,
            year: year,
            type: data.type,

            unitOldId: cus?.units[0] ? cus?.units[0]?.id : null,
            unitOld: cus?.units[0]
              ? {
                  id: cus?.units[0]?.id,
                  date: cus?.units[0]?.date,
                  unitNumber: cus?.units[0]?.unitNumber,
                }
              : {
                  id: null,
                  date: dayjs(beforeDate).format('MM/YYYY'),
                  unitNumber: `ไม่มีหน่วย ณ ${dayjs(beforeDate).format('MM/YYYY')}`,
                },
            unitNewId: cus?.units[1] ? cus?.units[1]?.id : null,
            unitNew: cus?.units[1]
              ? {
                  id: cus?.units[1]?.id,
                  date: cus?.units[1]?.date,
                  unitNumber: cus?.units[1].unitNumber,
                }
              : {
                  id: null,
                  date: dayjs(currentDate).format('MM/YYYY'),
                  unitNumber: `ไม่มีหน่วย ณ ${dayjs(currentDate).format('MM/YYYY')}`,
                },

            unitUsed,
            amount,
            overDue: tranEmpBefore ? tranEmpBefore?.totalPrice : 0,
            totalPrice: tranEmpBefore ? tranEmpBefore?.totalPrice + amount : amount,
            status: 'PENDING',
            customerId: cus.id,
            zoneId: cus.zoneId,

            no: index + 1,
            prefix: cus.prefix.prefixName ? cus.prefix.prefixName : '-',
            fullname: `${cus.firstName}  ${cus.lastName}`,
            houseNumber: cus.houseNumber,
            zoneName: cus.zone.zoneName,
          }
        : {
            ...cus.transactions[0],

            // unitNewId: cus.units[0].id ? cus.units[0].id : '-',
            // unitNew: cus.units[0] ? cus.units[0] : '-',

            // unitOldId: cus.units[1].id ? cus.units[1].id : '-',
            // unitOld: cus.units[1] ? cus.units[1] : '-',
            // overDue: tranEmp ? tranEmp : 0,

            no: index + 1,
            prefix: cus.prefix.prefixName ? cus.prefix.prefixName : '-',
            fullname: `${cus.firstName}  ${cus.lastName}`,
            houseNumber: cus.houseNumber,
            zoneName: cus.zone.zoneName,
          };
    });

    // res.status(200).json({ message: 'ok', data: result, total_record });
    res.status(200).json(ResponseSuccess({ data: result, total_record }));
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

export const updateOrCreateTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user.data;
    const { data, error } = createTransactionsSchema.safeParse(req.body);

    if (error) return next(createError(error.message, 400));

    if (role !== 'ADMIN') {
      return next(createError('Is not Admin', 400));
    }

    const operations = data.map(async item => {
      const currentDate = new Date(dayjs(item.date).startOf('month').format('YYYY-MM-DD'));
      if (item.id !== 0) {
        return await prisma.transaction.update({
          where: {
            id: item.id,
          },
          data: {
            date: currentDate,
            month: item.month,
            year: item.year,
            type: item.type,
            unitNewId: item.unitNewId,
            unitOldId: item.unitOldId,
            unitUsed: item.unitUsed,
            amount: item.amount,
            overDue: item.overDue,
            totalPrice: item.totalPrice,
            status: item.status,
            zoneId: item.zoneId,
            customerId: item.customerId,
          },
        });
      } else if (item.id === 0) {
        return await prisma.transaction.create({
          data: {
            date: currentDate,
            month: item.month,
            year: item.year,
            type: item.type,
            unitNewId: item.unitNewId,
            unitOldId: item.unitOldId,
            unitUsed: item.unitUsed,
            amount: item.amount,
            overDue: item.overDue,
            totalPrice: item.totalPrice,
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

export const getByIdTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user.data;
    const { id } = req.query;

    if (role !== 'ADMIN') return createError('Is not admin', 500);

    const result = await prisma.transaction.findUnique({
      where: {
        id: +id,
      },
      select: {
        id: true,
        date: true,
        month: true,
        year: true,
        type: true,
        unitOldId: true,
        unitOld: {
          select: {
            id: true,
            date: true,
            type: true,
            unitNumber: true,
          },
        },

        unitNewId: true,
        unitNew: {
          select: {
            id: true,
            date: true,
            type: true,
            unitNumber: true,
          },
        },

        unitUsed: true,
        amount: true,
        overDue: true,
        totalPrice: true,
        status: true,
        customerId: true,
        Customer: {
          select: {
            id: true,
            prefix: {
              select: {
                prefixName: true,
              },
            },
            firstName: true,
            lastName: true,
          },
        },
        zoneId: true,
        zone: {
          select: {
            id: true,
            zoneName: true,
          },
        },
        payment: {
          select: {
            id: true,
            imgSlip: true,
            date: true,
            amount: true,
            status: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            userId: true,
            approveby: true,
          },
        },
      },
    });

    res.status(200).json({ status: true, message: 'success', data: result });
  } catch (error) {
    console.error(error);
  }
};
