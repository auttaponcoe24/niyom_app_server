import prisma from '@/models/prisma';
import createError from '@/utils/create-error';
import { createZoneSchema, deleteZoneSchema, getAllZoneSchema, getByIdZoneSchema, updateZoneSchema } from '@/validators/zone.validator';
import { NextFunction, Response, Request } from 'express';

export const createZone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user.data;

    // const values: TZone = req.body;
    const { data, error } = createZoneSchema.safeParse(req.body);

    if (error) {
      return next(createError(error.message, 401));
    }

    if (role !== 'ADMIN') {
      return next(createError('not admin', 401));
    }

    const result = await prisma.zone.create({
      data: {
        zoneName: data.zoneName,
      },
    });

    res.status(201).json({ message: 'ok', data: result });
  } catch (error) {
    next(error);
  }
};

export const getAllZone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = getAllZoneSchema.safeParse(req.query);

    if (error) {
      return next(createError(error.message, 401));
    }

    const result = await prisma.zone.findMany({
      skip: (Number(data.start) - 1) * Number(data.pageSize),
      take: Number(data.pageSize),
      where: {
        zoneName: {
          contains: String(data.keywords),
        },
      },
    });

    const total_record = await prisma.zone.count({
      where: {
        zoneName: {
          contains: String(data.keywords),
        },
      },
    });

    res.status(200).json({ message: 'ok', data: result, total_record });
  } catch (error) {
    next(error);
  }
};

export const getByIdZone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = getByIdZoneSchema.safeParse(req.query);

    if (error) {
      return next(createError(error.message, 400));
    }

    const result = await prisma.zone.findUnique({
      where: {
        id: +data.id,
      },
    });

    res.status(200).json({ message: 'Get zone by id is successfully', data: result });
  } catch (error) {
    console.error('Get zone by id is failed', 400);
    return next(error);
  }
};

export const updateZone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user.data;

    const { data, error } = updateZoneSchema.safeParse(req.body);

    if (role !== 'ADMIN') {
      return next(createError('not admin', 401));
    }

    if (error) {
      return next(createError(error.message, 401));
    }

    const result = await prisma.zone.update({
      where: {
        id: data.id,
      },
      data: {
        zoneName: data.zoneName,
      },
    });

    res.status(201).json({ message: 'Update zone successfully', data: result });
  } catch (error) {
    return next(error);
  }
};

export const deleteZone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user.data;
    const { data, error } = deleteZoneSchema.safeParse(req.body);

    if (error) {
      return next(createError(error.message, 401));
    }

    if (role !== 'ADMIN') {
      return next(createError('not admin', 401));
    }

    const result = await prisma.zone.delete({
      where: {
        id: data.id,
      },
    });

    res.status(201).json({ message: 'Delete zone successfully', data: result });
  } catch (error) {
    console.error('Delete zone failed', 401);
    return next(error);
  }
};
