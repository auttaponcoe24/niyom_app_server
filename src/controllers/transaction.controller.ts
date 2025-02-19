import prisma from '@/models/prisma';
import createError from '@/utils/create-error';
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

    const currentDate = new Date(dayjs(data.date, 'YYYY-MM-DD').startOf('month').format('YYYY-MM-DD'));
    const beforeDate = new Date(
      dayjs(data.date, 'YYYY-MM-DD')
        .startOf('month') // ไปที่วันที่ 1 ของเดือน
        .subtract(1, 'month') // เลื่อนเดือนก่อนหน้า
        .format('YYYY-MM-DD'), // แปลงเป็นรูปแบบ 'YYYY-MM-DD'
    );

    const whereType = data.type === 'W' ? { isServiceWater: true } : data.type === 'E' ? { isServiceElectric: true } : '';

    const whereCustomer = {
      ...whereType,
      zoneId: +data.zoneId,
      id: {
        contains: String(data.customerId),
      },
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
      ],
    };

    const customers = await prisma.customer.findMany({
      take: +data.pageSize,
      skip: (+data.start - 1) * +data.pageSize,
      where: { ...whereCustomer },
      select: {
        id: true,
        no: true,
        firstName: true,
        lastName: true,
        houseNumber: true,
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
            date: {
              gte: beforeDate,
              lte: currentDate,
            },
            type: data.type,
          },
          select: {
            id: true,
            date: true,
            type: true,
            unitNumber: true,
          },
          orderBy: [{ date: 'desc' }],
        },
        transactions: {
          where: {
            date: currentDate,
            type: data.type,
          },
          select: {
            id: true,
            date: true,
            type: true,
            unitOld: {
              select: {
                id: true,
                date: true,
                unitNumber: true,
              },
            },
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
            total: true,
            pay: true,
            remain: true,
            status: true,
            customerId: true,
            zoneId: true,
            approved: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            approvedAt: true,
          },
          orderBy: [{ id: 'desc' }],
        },
      },
      orderBy: { no: 'asc' },
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

    // const units = await prisma.unit.findMany({
    //   where: {
    //     date: currentDate, // ใช้ currentDate เป็นตัวกำหนดวันที่
    //   },
    //   include: {
    //     customer: true, // รวมข้อมูลลูกค้าด้วย
    //     zone: true, // รวมข้อมูลโซน
    //   },
    // });
    const units = await prisma.unit.findMany({
      where: {
        date: {
          in: [currentDate, beforeDate],
        },
      },
      include: {
        customer: true,
      },
    });

    const result = customers.map((cus, index: number) => {
      const tranEmpBefore = findTransactionBefore.find(item => item.customerId === cus.id);

      const unitNew = units.find(unit => unit.customerId === cus.id && unit.date.getTime() === currentDate.getTime());
      const unitOld = units.find(unit => unit.customerId === cus.id && unit.date.getTime() === beforeDate.getTime());

      // console.log('new', unitNew);
      // console.log('old', unitOld);

      const unitNewNumber = unitNew?.unitNumber || 0;
      const unitOldNumber = unitOld?.unitNumber || 0;
      const unitUsed = unitNewNumber - unitOldNumber;

      const amount = data.type === 'W' ? unitUsed * 16 + 50 : unitUsed * 7 + 50 * 0.07;

      return cus.transactions.length === 0
        ? {
            id: 0,
            date: currentDate,
            type: data.type,
            unitNewId: unitNew?.id ? unitNew.id : null,
            unitNew: unitNew
              ? {
                  id: unitNew.id,
                  date: unitNew.date,
                  type: unitNew.type,
                  unitNumber: unitNew.unitNumber,
                  customerId: unitNew.customerId,
                  zoneId: unitNew.zoneId,
                }
              : {
                  id: 0,
                  date: dayjs(currentDate).format('YYYY-MM-DD'),
                  type: data.type,
                  unitNumber: null,
                  customerId: cus?.id,
                  zoneId: data.zoneId,
                },
            unitOldId: unitOld?.id ? unitOld.id : null,
            unitOld: unitOld
              ? {
                  id: unitOld.id,
                  date: unitOld.date,
                  type: unitOld.type,
                  unitNumber: unitOld.unitNumber,
                  customerId: unitOld.id,
                  zoneId: unitOld.zoneId,
                }
              : {
                  id: 0,
                  date: dayjs(beforeDate).format('YYYY-MM-DD'),
                  type: data.type,
                  unitNumber: null,
                  customerId: cus?.id,
                  zoneId: data.zoneId,
                },

            unitUsed,
            amount,
            overDue: tranEmpBefore ? tranEmpBefore?.remain + 50 : 0, // คงเหลือเดือนที่แล้ว + 50
            total: tranEmpBefore ? tranEmpBefore?.remain + 50 + amount : amount,
            pay: 0,
            remain: 0,
            status: 'WAITING',
            customerId: cus.id,
            zoneId: cus.zone.id,
            approved: null,
            approvedAt: null,

            no: cus.no,
            prefix: cus.prefix.prefixName ? cus.prefix.prefixName : '-',
            fullName: `${cus.firstName} ${cus.lastName}`,
            houseNumber: cus.houseNumber,
            zoneName: cus.zone.zoneName,
          }
        : {
            id: cus.transactions[0].id,
            date: cus.transactions[0].date ? dayjs(cus.transactions[0].date).format('YYYY-MM-DD') : null,
            type: cus.transactions[0].type,
            unitNewId: cus.transactions[0]?.unitNew.id,
            unitNew: cus?.transactions[0]?.unitNew
              ? {
                  id: cus.transactions[0].unitNew.id,
                  date: cus.transactions[0].unitNew.date,
                  type: cus?.transactions[0].type,
                  unitNumber: cus.transactions[0].unitNew.unitNumber,
                  customerId: cus?.id,
                  zoneId: cus?.zone?.id,
                }
              : {
                  id: 0,
                  date: dayjs(currentDate).format('YYYY-MM-DD'),
                  type: cus?.units[0]?.type,
                  unitNumber: cus?.units[0]?.unitNumber,
                  customerId: cus?.id,
                  zoneId: cus?.zone?.id,
                },
            unitOldId: cus?.transactions[0]?.unitOld?.id, // แก้ไขตรงนี้
            unitOld: cus?.transactions[0]?.unitOld
              ? {
                  id: cus?.transactions[0]?.unitOld.id,
                  date: cus?.transactions[0]?.unitOld.date,
                  type: cus?.transactions[0]?.type,
                  unitNumber: cus?.transactions[0]?.unitOld?.unitNumber,
                  customerId: cus?.id,
                  zoneId: cus?.zone?.id,
                }
              : {
                  id: 0,
                  date: dayjs(beforeDate).format('YYYY-MM-DD'),
                  type: cus?.transactions[0]?.type,
                  unitNumber: cus?.units[1]?.unitNumber,
                  customerId: cus?.id,
                  zoneId: cus?.zone?.id,
                },
            unitUsed: cus.transactions[0].unitUsed,
            amount: cus.transactions[0].amount,
            overDue: cus.transactions[0].overDue,
            total: cus.transactions[0].total,
            pay: cus.transactions[0].pay,
            remain: cus.transactions[0].remain,
            status: cus.transactions[0].status,
            customerId: cus.id,
            zoneId: cus.zone.id,
            approved: cus.transactions[0].approved,
            approvedAt: cus.transactions[0].approvedAt,
            no: cus.no,
            prefix: cus.prefix.prefixName ? cus.prefix.prefixName : '-',
            fullName: `${cus.firstName} ${cus.lastName}`,
            houseNumber: cus.houseNumber,
            zoneName: cus.zone.zoneName,
          };
    });

    res.status(200).json({ status: true, message: 'ok', data: result, total_record });
  } catch (error: any) {
    next(error);
  }
};
// export const getAllTransaction = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { role } = req.user.data;
//     const { data, error } = getAllTransactionSchema.safeParse(req.query);

//     if (error) {
//       return next(createError(error.message, 404));
//     }

//     if (role !== 'ADMIN') {
//       return next(createError('Is Not Admin', 404));
//     }

//     const currentDate = new Date(dayjs(data.date, 'YYYY-MM-DD').startOf('month').format('YYYY-MM-DD'));
//     const beforeDate = new Date(
//       dayjs(data.date, 'YYYY-MM-DD')
//         .startOf('month') // ไปที่วันที่ 1 ของเดือน
//         .subtract(1, 'month') // เลื่อนเดือนก่อนหน้า
//         .format('YYYY-MM-DD'), // แปลงเป็นรูปแบบ 'YYYY-MM-DD'
//     );

//     const whereType = data.type === 'W' ? { isServiceWater: true } : data.type === 'E' ? { isServiceElectric: true } : '';

//     const whereCustomer = {
//       ...whereType,
//       zoneId: +data.zoneId,
//       id: {
//         contains: String(data.customerId),
//       },
//       OR: [
//         {
//           firstName: {
//             contains: String(data.keywords),
//           },
//         },
//         {
//           lastName: {
//             contains: String(data.keywords),
//           },
//         },
//       ],
//     };

//     const customers = await prisma.customer.findMany({
//       take: +data.pageSize,
//       skip: (+data.start - 1) * +data.pageSize,
//       where: { ...whereCustomer },
//       select: {
//         id: true,
//         no: true,
//         firstName: true,
//         lastName: true,
//         houseNumber: true,
//         prefix: {
//           select: {
//             id: true,
//             prefixName: true,
//           },
//         },
//         zone: {
//           select: {
//             id: true,
//             zoneName: true,
//           },
//         },
//         units: {
//           where: {
//             date: {
//               gte: beforeDate,
//               lte: currentDate,
//             },
//             type: data.type,
//           },
//           select: {
//             id: true,
//             date: true,
//             type: true,
//             unitNumber: true,
//           },
//           orderBy: [{ date: 'asc' }], // เรียงวันน้อยก่อน หรือเดือนก่อนขึ้นก่อน
//         },
//         transactions: {
//           where: {
//             date: currentDate,
//             type: data.type,
//           },
//           select: {
//             id: true,
//             date: true,
//             type: true,
//             unitOld: {
//               select: {
//                 id: true,
//                 date: true,
//                 unitNumber: true,
//               },
//             },
//             unitNew: {
//               select: {
//                 id: true,
//                 date: true,
//                 unitNumber: true,
//               },
//             },
//             unitUsed: true,
//             amount: true,
//             overDue: true,
//             total: true,
//             pay: true,
//             remain: true,
//             status: true,
//             customerId: true,
//             zoneId: true,
//             approved: {
//               select: {
//                 id: true,
//                 firstName: true,
//                 lastName: true,
//               },
//             },
//             approvedAt: true,
//           },
//           orderBy: [{ id: 'desc' }],
//         },
//       },
//       orderBy: { no: 'asc' },
//     });

//     const total_record = await prisma.customer.count({
//       where: whereCustomer,
//     });

//     const findTransactionBefore = await prisma.transaction.findMany({
//       where: {
//         date: {
//           lte: beforeDate,
//         },
//         type: data.type,
//       },
//     });

//     const result = customers.map((cus, index: number) => {
//       // const unitOldNumber = cus?.units[0]?.unitNumber;
//       // const unitNewNumber = cus?.units[1]?.unitNumber;
//       // const unitUsed = unitNewNumber - unitOldNumber;
//       const unitOldNumber = cus?.units[0]?.unitNumber || 0; // กำหนดค่าเป็น 0 ถ้าไม่มีค่า
//       const unitNewNumber = cus?.units[1]?.unitNumber || 0;
//       const unitUsed = unitNewNumber - unitOldNumber;

//       const amount = data.type === 'W' ? unitUsed * 16 + 50 : unitUsed * 7 + 50 * 0.07;

//       const tranEmpBefore = findTransactionBefore.find(item => item.customerId === cus.id);

//       return cus.transactions.length === 0
//         ? {
//             id: 0,
//             date: currentDate,
//             type: data.type,
//             unitNewId: cus?.units[1] ? cus?.units[0]?.id : null,
//             unitNew: cus?.units[1]
//               ? {
//                   id: cus?.units[1]?.id,
//                   date: cus?.units[1]?.date,
//                   type: cus?.units[1]?.type,
//                   unitNumber: cus?.units[1]?.unitNumber,
//                   customerId: cus?.id,
//                   zoneId: cus?.zone?.id,
//                 }
//               : {
//                   id: 0,
//                   date: dayjs(currentDate).format('YYYY-MM-DD'),
//                   type: cus?.units[0]?.type,
//                   unitNumber: null,
//                   customerId: cus?.id,
//                   zoneId: cus?.zone?.id,
//                 },
//             unitOldId: cus?.units[0] ? cus?.units[0]?.id : null, // แก้ไขตรงนี้
//             unitOld: cus?.units[0]
//               ? {
//                   id: cus?.units[0]?.id,
//                   date: cus?.units[0]?.date,
//                   type: cus?.units[0]?.type,
//                   unitNumber: cus?.units[0].unitNumber,
//                   customerId: cus?.id,
//                   zoneId: cus?.zone?.id,
//                 }
//               : {
//                   id: 0,
//                   date: dayjs(beforeDate).format('YYYY-MM-DD'),
//                   type: cus?.units[1]?.type,
//                   unitNumber: null,
//                   customerId: cus?.id,
//                   zoneId: cus?.zone?.id,
//                 },

//             unitUsed,
//             amount,
//             overDue: tranEmpBefore ? tranEmpBefore?.remain + 50 : 0, // คงเหลือเดือนที่แล้ว + 50
//             total: tranEmpBefore ? tranEmpBefore?.remain + 50 + amount : amount,
//             pay: 0,
//             remain: 0,
//             status: 'WAITING',
//             customerId: cus.id,
//             zoneId: cus.zone.id,
//             approved: null,
//             approvedAt: null,

//             no: cus.no,
//             prefix: cus.prefix.prefixName ? cus.prefix.prefixName : '-',
//             fullName: `${cus.firstName} ${cus.lastName}`,
//             houseNumber: cus.houseNumber,
//             zoneName: cus.zone.zoneName,
//           }
//         : {
//             id: cus.transactions[0].id,
//             date: cus.transactions[0].date ? dayjs(cus.transactions[0].date).format('YYYY-MM-DD') : null,
//             type: cus.transactions[0].type,
//             unitNewId: cus.transactions[0]?.unitNew.id,
//             unitNew: cus?.transactions[0]?.unitNew
//               ? {
//                   id: cus.transactions[0].unitNew.id,
//                   date: cus.transactions[0].unitNew.date,
//                   type: cus?.transactions[0].type,
//                   unitNumber: cus.transactions[0].unitNew.unitNumber,
//                   customerId: cus?.id,
//                   zoneId: cus?.zone?.id,
//                 }
//               : {
//                   id: 0,
//                   date: dayjs(currentDate).format('YYYY-MM-DD'),
//                   type: cus?.units[1]?.type,
//                   unitNumber: null,
//                   customerId: cus?.id,
//                   zoneId: cus?.zone?.id,
//                 },
//             unitOldId: cus?.transactions[0]?.unitOld?.id, // แก้ไขตรงนี้
//             unitOld: cus?.transactions[0]?.unitOld
//               ? {
//                   id: cus?.transactions[0]?.unitOld.id,
//                   date: cus?.transactions[0]?.unitOld.date,
//                   type: cus?.transactions[0]?.type,
//                   unitNumber: cus?.transactions[0]?.unitOld?.unitNumber,
//                   customerId: cus?.id,
//                   zoneId: cus?.zone?.id,
//                 }
//               : {
//                   id: 0,
//                   date: dayjs(beforeDate).format('YYYY-MM-DD'),
//                   type: cus?.transactions[0]?.type,
//                   unitNumber: null,
//                   customerId: cus?.id,
//                   zoneId: cus?.zone?.id,
//                 },
//             unitUsed: cus.transactions[0].unitUsed,
//             amount: cus.transactions[0].amount,
//             overDue: cus.transactions[0].overDue,
//             total: cus.transactions[0].total,
//             pay: cus.transactions[0].pay,
//             remain: cus.transactions[0].remain,
//             status: cus.transactions[0].status,
//             customerId: cus.id,
//             zoneId: cus.zone.id,
//             approved: cus.transactions[0].approved,
//             approvedAt: cus.transactions[0].approvedAt,
//             no: cus.no,
//             prefix: cus.prefix.prefixName ? cus.prefix.prefixName : '-',
//             fullName: `${cus.firstName} ${cus.lastName}`,
//             houseNumber: cus.houseNumber,
//             zoneName: cus.zone.zoneName,
//           };
//     });

//     // res.status(200).json({
//     //   status: 'success',
//     //   data: result,
//     //   page: +data.page,
//     //   total_page: Math.ceil(total_record / +data.pageSize),
//     //   total_record,
//     // });
//     res.status(200).json({ status: true, message: 'ok', data: result, total_record });
//   } catch (error: any) {
//     next(error);
//   }
// };

export const updateOrCreateTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user.data;
    const { data, error } = createTransactionsSchema.safeParse(req.body);

    if (error) return next(createError(error.message, 400));

    if (role !== 'ADMIN') {
      return next(createError('Is not Admin', 400));
    }

    const operations = data.map(async transaction => {
      const currentDate = new Date(dayjs(transaction.date, 'YYYY-MM-DD').format('YYYY-MM-DD'));
      if (transaction.id !== 0) {
        return await prisma.transaction.update({
          where: {
            id: transaction.id,
          },
          data: {
            date: currentDate,
            type: transaction.type,
            unitOldId: transaction.unitOldId,
            unitNewId: transaction.unitNewId,
            unitUsed: transaction.unitUsed,
            amount: transaction.amount,
            overDue: transaction.overDue,
            total: transaction.total,
            pay: transaction.pay,
            remain: transaction.remain,
            status: transaction.status,
            customerId: transaction.customerId,
            zoneId: transaction.zoneId,
          },
        });
      } else if (transaction.id === 0) {
        return await prisma.transaction.create({
          data: {
            date: currentDate,
            type: transaction.type,
            unitOldId: transaction.unitOldId,
            unitNewId: transaction.unitNewId,
            unitUsed: transaction.unitUsed,
            amount: transaction.amount,
            overDue: transaction.overDue,
            total: transaction.total,
            pay: transaction.pay,
            remain: transaction.remain,
            status: transaction.status,
            customerId: transaction.customerId,
            zoneId: transaction.zoneId,
          },
        });
      }
    });

    const results = await Promise.all(operations);

    res.status(201).json({ status: true, message: 'ok', result: results });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const updateById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user.data;

    if (role !== 'ADMIN') return next(createError('user is not admin', 401));

    const { transactionId } = req.params;
    const update = req.body as {
      unitNumberOld: number;
      unitNumberNew: number;
      unitUsed: number;
      amount: number;
      overDue: number;
      total: number;
    };

    const transaction = await prisma.transaction.findUnique({
      where: {
        id: +transactionId,
      },
    });

    if (!transaction) {
      return next(createError('Transaction ID is required', 400));
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: Number(transactionId) },
      data: {
        unitNew: {
          update: {
            unitNumber: update.unitNumberNew,
          },
        },
        unitOld: {
          update: {
            unitNumber: update.unitNumberOld,
          },
        },
        unitUsed: update.unitUsed,
        amount: update.amount,
        overDue: update.overDue,
        total: update.total,
      },
    });

    res.status(201).json(updatedTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ message: 'Internal Server Error' });
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
        pay: true,
        remain: true,
        total: true,
        status: true,
        customer: {
          select: {
            id: true,
            prefix: {
              select: {
                id: true,
                prefixName: true,
              },
            },
            firstName: true,
            lastName: true,
          },
        },
        zone: {
          select: {
            id: true,
            zoneName: true,
          },
        },
      },
    });

    res.status(200).json({ status: true, message: 'success', data: result });
  } catch (error) {
    console.error(error);
  }
};

export const payTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, role } = req.user.data;
    const query = req.query as {
      id: string;
      pay: string;
    };

    if (role !== 'ADMIN') return next(createError('user is not admin', 500));

    const transaction = await prisma.transaction.findUnique({
      where: {
        id: +query.id,
      },
    });

    if (!transaction) return next(createError(`transactionId ${query.id} is not found`, 400));

    const update = await prisma.transaction.update({
      where: {
        id: transaction.id,
      },
      data: {
        pay: +query.pay,
        remain: transaction.total - +query.pay,
        status: 'PAY',
        approvedBy: id,
        approvedAt: new Date(dayjs().format('YYYY-MM-DD')),
      },
    });

    res.status(201).json({ status: true, message: 'pay is successfully', data: update });
  } catch (error) {
    console.error(error);
  }
};
