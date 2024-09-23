import prisma from '@/models/prisma';
import createError from '@/utils/create-error';
import { createZoneSchema, deleteZoneSchema, getAllZoneSchema, getByIdZoneSchema, updateZoneSchema } from '@/validators/zone.validator';
import { NextFunction, Response, Request } from 'express';

export const createZone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user.result;

    // const values: TZone = req.body;
    const { zone_name } = req.body;
    const { value, error } = createZoneSchema.validate({ zone_name });

    if (error) {
      return next(createError(error.message, 401));
    }

    if (role !== 'ADMIN') {
      return next(createError('not admin', 401));
    }

    const result = await prisma.zone.create({
      // data: {
      //   zone_name: value.zone_name,
      // },
      data: value,
    });

    res.status(201).json({ message: 'ok', result });
  } catch (error) {
    next(error);
  }
};

export const getAllZone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user.result;
    const { start, page_size, keywords } = req.query;
    const { value, error } = getAllZoneSchema.validate({ start, page_size, keywords });

    if (error) {
      return next(createError(error.message, 401));
    }

    if (role !== 'ADMIN') {
      return next(createError('not admin', 201));
    }
    const result = await prisma.zone.findMany({
      skip: (Number(value.start) - 1) * Number(value.page_size),
      take: Number(value.page_size),
      where: {
        zone_name: {
          contains: String(value.keywords),
        },
      },
    });

    const total_record = await prisma.zone.findMany();

    res.status(200).json({ message: 'ok', result, total_record: total_record.length });
  } catch (error) {
    next(error);
  }
};

export const getByIdZone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user.result;
    const { id } = req.query;
    const { value, error } = getByIdZoneSchema.validate({ id });

    if (error) {
      return next(createError(error.message, 400));
    }

    if (role !== 'ADMIN') {
      return next(createError('User is not ADMIN', 400));
    }
    const result = await prisma.zone.findUnique({
      where: {
        id: value.id,
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

    const { id, zone_name } = req.body;
    const { value, error } = updateZoneSchema.validate({ id, zone_name });

    if (role !== 'ADMIN') {
      return next(createError('not admin', 401));
    }

    if (error) {
      return next(createError(error.message, 401));
    }

    const result = await prisma.zone.update({
      where: {
        id: value.id,
      },
      data: {
        zone_name: value.zone_name,
      },
    });

    res.status(201).json({ message: 'Update zone successfully', result });
  } catch (error) {
    return next(error);
  }
};

export const deleteZone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user.result;

    const { id } = req.body;
    const { value, error } = deleteZoneSchema.validate({ id });

    if (error) {
      return next(createError(error.message, 401));
    }

    if (role !== 'ADMIN') {
      return next(createError('not admin', 401));
    }

    const result = await prisma.zone.delete({
      where: {
        id: value.id,
      },
    });

    res.status(201).json({ message: 'Delete zone successfully', result });
  } catch (error) {
    console.error('Delete zone failed', 401);
    return next(error);
  }
};
