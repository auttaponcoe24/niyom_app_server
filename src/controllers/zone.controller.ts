import { TZone } from '@/interfaces/zone.interface';
import prisma from '@/models/prisma';
import createError from '@/utils/create-error';
import { NextFunction, Response, Request } from 'express';

export const createZone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user.result;

    const values: TZone = req.body;
    // const { zone_name } = req.body;

    if (role !== 'ADMIN') {
      return next(createError('not admin', 401));
    }

    const result = await prisma.zone.create({
      data: values,
    });

    res.status(201).json({ message: 'ok', result });
  } catch (error) {
    next(error);
  }
};

export const getByIdZone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user.result;
    const { id } = req.query;

    if (role !== 'ADMIN') {
      return next(createError('User is not ADMIN', 400));
    }
    const result = await prisma.zone.findUnique({
      where: {
        id: Number(id),
      },
    });

    res.status(200).json({ message: 'Get zone by id is successfully', result });
  } catch (error) {
    console.error('Get zone by id is failed', 400);
    return next(error);
  }
};

export const updateZone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user.result;

    const { id, name } = req.body;

    if (role !== 'ADMIN') {
      return next(createError('not admin', 401));
    }

    const result = await prisma.zone.update({
      where: {
        id: id,
      },
      data: {
        zone_name: name,
      },
    });

    res.status(201).json({ message: 'Update zone successfully', result });
  } catch (error) {
    next(error);
  }
};

export const getAllZone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user.result;
    const { start, page_size, keywords } = req.query;

    if (role !== 'ADMIN') {
      return next(createError('not admin', 201));
    }
    const result = await prisma.zone.findMany({
      skip: (Number(start) - 1) * Number(page_size),
      take: Number(page_size),
      where: {
        zone_name: {
          contains: String(keywords),
        },
      },
    });

    const total_record = await prisma.zone.findMany();

    res.status(200).json({ message: 'ok', result, total_record: total_record.length });
  } catch (error) {
    next(error);
  }
};

export const deleteZone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user.result;

    const { id } = req.body;

    if (role !== 'ADMIN') {
      return next(createError('not admin', 401));
    }

    const result = await prisma.zone.delete({
      where: {
        id: id,
      },
    });

    res.status(201).json({ message: 'Delete zone successfully', result });
  } catch (error) {
    console.error('Delete zone failed', 401);
    return next(error);
  }
};
