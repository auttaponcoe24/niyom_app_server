import prisma from '@/models/prisma';
import createError from '@/utils/create-error';
import { NextFunction, Request, Response } from 'express';

export const createPrefix = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prefix_name } = req.body;
    const { role } = req.user.result;

    if (role !== 'ADMIN') {
      return next(createError('User is not admin', 401));
    }

    const prefix = await prisma.prefix.create({
      data: {
        prefix_name,
      },
    });

    res.status(201).json({ message: 'Create prefix successfully', result: prefix });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

export const getAllPrefix = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { start, page_size, keywords } = req.query;

    const prefixAll = await prisma.prefix.findMany({
      take: Number(page_size),
      skip: (Number(start) - 1) * Number(page_size),
      where: {
        prefix_name: {
          contains: keywords as string,
        },
      },
    });

    const total_record = await prisma.prefix.count();

    res.status(200).json({ message: 'ok', result: prefixAll, total_record });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};
