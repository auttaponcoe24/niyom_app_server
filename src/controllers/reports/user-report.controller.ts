import prisma from '@/models/prisma';
import createError from '@/utils/create-error';
import dayjs from 'dayjs';
import { NextFunction, Request, Response } from 'express';
import { ReportsService } from '@/utils/reports-service';

type ReportDto = {
  reportType?: 'pdf' | 'html' | 'preview';
  lang?: 'th' | 'en';
  typeData?: 'W' | 'E';
  date?: string;
  zoneId?: number;
};

export const userReport = async (req: Request, res: Response, next: NextFunction) => {
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
    const { reportType, lang, typeData, date, zoneId } = req.body as ReportDto;

    dayjs.locale(lang === 'th' ? 'th' : 'en');

    const dateFormat = new Date(dayjs(date).format('YYYY-MM-DD'));

    const headerDate = dayjs(date).format('MMMM YYYY');

    if (role !== 'ADMIN') return next(createError('Is not admin', 500));

    const findZone = await prisma.zone.findUnique({
      where: {
        id: zoneId,
      },
      select: {
        id: true,
        zoneName: true,
      },
    });

    const headerReport = `ประจำเดือน ${headerDate} ( ${findZone.zoneName} )`;

    const getCustomer = await prisma.customer.findMany({
      where: {
        zoneId: zoneId,
      },
      orderBy: [{ houseNumber: 'asc' }],
      select: {
        firstName: true,
        lastName: true,
        phoneNumber: true,
        houseNumber: true,
        isActive: true,
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
            date: dateFormat,
            type: typeData,
          },
          select: {
            type: true,

            unitOld: {
              select: {
                date: true,
                unitNumber: true,
              },
            },
            unitNew: {
              select: {
                date: true,
                unitNumber: true,
              },
            },
            unitUsed: true,
            amount: true,
            overDue: true,
            totalPrice: true,
            status: true,
            payment: true,
          },
        },
      },
    });

    // const dateUnitOld = dayjs(getCustomer[0]?.transactions[0]?.unitOld?.date).add(14, 'day').format('DD/MMM/YY');
    // const dateUnitNew = dayjs(getCustomer[0]?.transactions[0]?.unitNew?.date).add(14, 'day').format('DD/MMM/YY');
    const dateUnitOld = dayjs(getCustomer[0]?.transactions[0]?.unitOld?.date).format('MMMYY');
    const dateUnitNew = dayjs(getCustomer[0]?.transactions[0]?.unitNew?.date).format('MMMYY');

    // console.log(getCustomer[0], dateUnitOld, dateUnitNew);

    const reportData = {
      name: new Date().getTime(),
      data: new Date().toLocaleDateString(),
      printed: dayjs().format('DD-MM-YYYY HH:mm:ss'),
      lang: lang,
      headerReport,
      dateUnitOld,
      dateUnitNew,
      getCustomer,
    };

    // สร้างอินสแตนซ์ของ ReportsService
    const reportsService = new ReportsService();
    const htmlContent = await reportsService.handleLoadEjs('transactionReport/index.ejs', reportData);

    // res.send(htmlContent);

    return await reportsService.generateStreamPdfOrXcel(reportType as 'html' | 'pdf' | 'excel', `${reportData.name}`, htmlContent, res);
  } catch (error) {
    throw error;
  }
};
