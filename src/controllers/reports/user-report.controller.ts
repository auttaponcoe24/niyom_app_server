import prisma from '@/models/prisma';
import createError from '@/utils/create-error';
import dayjs from 'dayjs';
import { NextFunction, Request, Response } from 'express';

type FilterReportDto = {
  reportType?: 'pdf' | 'html' | 'preview';
  lang?: 'th' | 'en';
  numberReport?: string;
  type_data?: string;
  date_start?: string;
  date_ended?: string;
  yyyy?: string | number;
  mm?: string | number;
  month?: string;
  site_id?: string | number;
  company_id?: string | number;
};

export const userReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user.result;

    if (role !== 'ADMIN') return next(createError('Is not admin', 500));

    const getCustomer = await prisma.user.findMany();

    const reportData = {
      name: new Date().getTime(),
      data: new Date().toLocaleDateString(),
      printed: dayjs().format('DD-MM-YYYY HH:mm:ss'),
      lang: 'TH',
      getCustomer,
    };
  } catch (error) {
    throw error;
  }
};
