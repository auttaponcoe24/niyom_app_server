import prisma from '@/models/prisma';
import createError from '@/utils/create-error';
import {
  createCustomerSchema,
  deleteCustomerSchema,
  getAllCustomerSchema,
  getByIdCustomerSchema,
  updateCustomerSchema,
} from '@/validators/customer.validator';
import { NextFunction, Request, Response } from 'express';

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user.result;
    const { prefixId, firstname, lastname, card_id, phone, house_number, address, zoneId } = req.body;
    const { value, error } = createCustomerSchema.validate({ prefixId, firstname, lastname, card_id, phone, house_number, address, zoneId });

    if (error) {
      return next(createError(error.message, 401));
    }

    if (role !== 'ADMIN') {
      return next(createError('User is not ADMIN', 401));
    }

    const result = await prisma.customer.create({
      data: value,
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

    // Validate query parameters
    const { value, error } = getAllCustomerSchema.validate({ start, page_size, keywords });
    if (error) {
      return next(createError(error.message, 400));
    }

    if (role !== 'ADMIN') {
      return next(createError('User is not ADMIN', 200));
    }

    // Retrieve total count of records
    const total_record = await prisma.customer.count();
    // const total_record = await prisma.customer.findMany();

    const result = await prisma.customer.findMany({
      skip: (Number(value.start) - 1) * Number(value.page_size),
      take: Number(value.page_size),
      include: {
        zone: true,
        prefix: true,
      },
      where: {
        OR: [
          {
            firstname: {
              contains: value.keywords,
            },
          },
          {
            lastname: {
              contains: value.keywords,
            },
          },
        ],
      },
    });

    res.status(200).json({ message: 'ok', result, total_record: total_record });
  } catch (error) {
    next(error);
  }
};

export const getByIdCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.query;
    const { value, error } = getByIdCustomerSchema.validate({ id });

    if (error) return next(createError(error.message, 400));

    const result = await prisma.customer.findUnique({
      where: {
        id: value.id,
      },
    });

    if (!result) return next(createError('customerId is empty', 400));

    res.status(200).json({ message: 'ok', result });
  } catch (error) {
    console.error('Get by customerId failed', 400);
    return next(error);
  }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user.result;
    const { id, card_id, firstname, lastname, phone, house_number, address, zoneId, prefixId } = req.body;
    const { value, error } = updateCustomerSchema.validate({ id, card_id, firstname, lastname, phone, house_number, address, zoneId, prefixId });

    if (error) return next(createError(error.message, 401));

    if (role !== 'ADMIN') {
      return next(createError('User is not ADMIN', 401));
    }

    const result = await prisma.customer.update({
      where: {
        id: value.id,
      },
      data: {
        card_id: value.card_id,
        firstname: value.firstname,
        lastname: value.lastname,
        phone: value.phone,
        house_number: value.house_number,
        address: value.address,
        zoneId: value.zoneId,
        prefixId: value.prefixId,
      },
    });

    res.status(201).json({ message: 'ok', result });
  } catch (error) {
    console.error('Update customer failed', error);
    return next(error);
  }
};

export const deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.body;
    const { value, error } = deleteCustomerSchema.validate({ id });

    if (error) return next(createError(error.message, 400));

    const result = await prisma.customer.delete({
      where: {
        id: value.id,
      },
    });

    // console.log(result);

    if (!result) return next(createError('Customer not found', 404));

    res.status(200).json({ message: 'ok', result });
  } catch (error) {
    console.error('Delete Customer failed', 500);
    return next(error);
  }
};
