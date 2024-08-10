import { ICustomer } from '@/interfaces/customer.interface';
import prisma from '@/models/prisma';
import createError from '@/utils/create-error';
import { NextFunction, Request, Response } from 'express';

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user.result;
    // const values: ICustomer = req.body;
    const { id_passpost, firstname, lastname, phone_number, house_number, address, zoneId } = req.body;

    if (role !== 'ADMIN') {
      return next(createError('User is not ADMIN', 401));
    }

    const result = await prisma.customer.create({
      data: {
        id_passpost,
        firstname,
        lastname,
        phone_number,
        house_number,
        address,
        zoneId,
      },
    });

    res.status(201).json({ message: 'ok', result });
  } catch (error) {
    console.error('Create customer failed', 401);
    return next(error);
  }
};

export const getAllCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user.result;
    const { start, page_size, keywords } = req.query;

    if (role !== 'ADMIN') {
      return next(createError('User is not ADMIN', 200));
    }

    const total_record = await prisma.customer.findMany();

    const result = await prisma.customer.findMany({
      skip: (Number(start) - 1) * Number(page_size),
      take: Number(page_size),
      include: {
        zone: true,
      },
    });

    const x = result.map(item => ({
      id: item.id,
      id_passpost: item.id_passpost,
    }));

    res.status(200).json({ message: 'ok', result, total_record: total_record.length });
  } catch (error) {
    next(error);
  }
};

export const getByIdCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.query;
    const result = await prisma.customer.findUnique({
      where: {
        id: Number(id),
      },
    });

    res.status(200).json({ message: 'ok', result });
  } catch (error) {
    console.error('Get by customerId failed', 400);
    return next(error);
  }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user.result;
    const { id, id_passpost, firstname, lastname, phone_number, house_number, address, zoneId } = req.body;

    if (role !== 'ADMIN') {
      return next(createError('User is not ADMIN', 401));
    }

    const result = await prisma.customer.update({
      where: {
        id: Number(id),
      },
      data: {
        id_passpost,
        firstname,
        lastname,
        phone_number,
        house_number,
        address,
        zoneId: Number(zoneId),
      },
    });
    res.status(201).json({ message: 'ok', result });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.body;

    const result = await prisma.customer.delete({
      where: {
        id: Number(id),
      },
    });

    res.status(201).json({ message: 'ok', result });
  } catch (error) {
    console.error('Delete Customer failed', 401);
    return next(error);
  }
};
