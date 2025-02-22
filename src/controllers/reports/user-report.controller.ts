import prisma from '@/models/prisma';
import createError from '@/utils/create-error';
import { ReportsService } from '@/utils/reports-service';
import dayjs from 'dayjs';
import { NextFunction, Request, Response } from 'express';

type ReportDto = {
  reportType?: 'pdf' | 'html' | 'preview';
  lang?: 'th' | 'en';
  typeData?: 'W' | 'E';
  date?: string;
  zoneId?: number;
};

export const userReport = async (req: Request, _res: Response, _next: NextFunction) => {
  try {
    const { role } = req.user.data;
    const { reportType, lang, typeData, zoneId } = req.body as ReportDto;
  } catch (error) {
    console.error(error);
  }
};

export const transactionReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user.data;
    const { reportType, lang, date, zoneId } = req.body as ReportDto;

    dayjs.locale(lang === 'th' ? 'th' : 'en');

    const headerDate = dayjs(date).format('MMMM BBBB');

    if (role !== 'ADMIN') return next(createError('user is not admin', 401));

    const findZone = await prisma.zone.findUnique({
      where: {
        id: zoneId,
      },
      select: {
        id: true,
        zoneName: true,
      },
    });

    const startDate = new Date(dayjs(date).startOf('month').format('YYYY-MM-DD'));
    const endDate = new Date(dayjs(date).endOf('month').format('YYYY-MM-DD'));

    // console.log('startDate', startDate);
    // console.log('endDate', endDate);

    const headerReport = `ประจำเดือน ${headerDate} ( ${findZone.zoneName} )`;

    const customers = await prisma.customer.findMany({
      where: {
        zoneId: zoneId,
      },
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
        transactions: {
          where: {
            date: {
              lte: endDate,
              gte: startDate,
            },
          },
          select: {
            id: true,
            date: true,
            type: true,
            unitOld: {
              select: {
                id: true,
                date: true,
                type: true,
                unitNumber: true,
              },
            },
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
          orderBy: [{ type: 'asc' }, { id: 'desc' }],
        },
      },
      orderBy: { no: 'asc' },
    });

    const transactions = customers.flatMap(customer =>
      customer.transactions.map(tran => ({
        id: customer.id,
        no: customer.no,
        type: tran.type ? (tran.type === 'W' ? 'น้ำ' : 'ไฟ') : null,
        fullName: `${customer.prefix.prefixName} ${customer.firstName} ${customer.lastName || ''}`,
        houseNumber: customer.houseNumber,
        unitNew: tran.unitNew ?? null,
        unitOld: tran.unitOld ?? null,
        unitUsed: tran.unitUsed ?? null,
        amount: tran.amount ?? null,
        overDue: tran.overDue ?? null,
        total: tran.total ?? null,
        pay: tran.pay ?? null,
        remain: tran.remain ?? null,
        status: tran.status ?? null,
        approved: tran.approved ?? null,
        approvedAt: tran.approvedAt ? dayjs(tran.approvedAt).format('DD/MMM/BB') : null,
      })),
    );

    // res.json(transactions);
    // return;

    const dateUnitOld = dayjs(date).subtract(1, 'month').format('MMMBB');
    const dateUnitNew = dayjs(date).startOf('month').format('MMMBB');

    // console.log(getCustomer[0], dateUnitOld, dateUnitNew);

    const reportData = {
      name: new Date().getTime(),
      data: new Date().toLocaleDateString(),
      printed: dayjs().format('DD-MM-YYYY HH:mm:ss'),
      lang: lang,
      headerReport,
      dateUnitOld,
      dateUnitNew,
      transactions,
    };

    // สร้างอินสแตนซ์ของ ReportsService
    const reportsService = new ReportsService();
    const htmlContent = await reportsService.handleLoadEjs('transactionReport/index.ejs', reportData);

    transactions.length > 0
      ? await reportsService.generateStreamPdfOrXcel(reportType as 'html' | 'pdf' | 'excel', `${reportData.name}`, htmlContent, res)
      : res.json({ status: true, message: 'No data', data: transactions });
  } catch (error) {
    throw error;
  }
};

export const receiptReport = async () => {
  try {
  } catch (error) {
    console.error(error);
    throw error;
  }
};
