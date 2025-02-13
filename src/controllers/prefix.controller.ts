import prisma from '@/models/prisma';
import createError from '@/utils/create-error';
import { NextFunction, Request, Response } from 'express';

export const createPrefix = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prefixName } = req.body as { prefixName: string };
    const { role } = req.user.data;

    if (role !== 'ADMIN') {
      return next(createError('User is not admin', 401));
    }

    const prefix = await prisma.prefix.create({
      data: {
        prefixName,
      },
    });

    res.status(201).json({ message: 'Create prefix successfully', data: prefix });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

export const getAllPrefix = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { start, pageSize, keywords } = req.query as { start: string; pageSize: string; keywords: string };

    const wherePrefin = {
      prefixName: {
        contains: keywords,
      },
    };

    const prefixAll = await prisma.prefix.findMany({
      take: Number(pageSize),
      skip: (Number(start) - 1) * Number(pageSize),
      where: wherePrefin,
    });

    const total_record = await prisma.prefix.count({
      where: wherePrefin,
    });

    res.status(200).json({ message: 'ok', data: prefixAll, total_record });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};
