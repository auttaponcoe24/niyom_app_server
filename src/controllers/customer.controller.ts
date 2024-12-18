import prisma from '@/models/prisma';
import upload from '@/utils/cloudinary-service';
import createError from '@/utils/create-error';
import { createCustomerSchema, updateCustomerSchema } from '@/validators/customer.validator';
import { NextFunction, Request, Response } from 'express';
import * as fs from 'fs/promises';

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user.data;
    // const { prefixId, firstname, lastname, card_id, phone, house_number, address, zoneId } = req.body;
    const { data, error } = createCustomerSchema.safeParse(req.body);

    if (error) {
      return next(createError(error.message, 401));
    }

    if (role !== 'ADMIN') {
      return next(createError('User is not ADMIN', 401));
    }

    const result = await prisma.customer.create({
      data: data,
    });

    res.status(201).json({ message: 'ok', data: result });
  } catch (error) {
    console.error('Create customer failed', 401);
    return next(error);
  }
};

export const getAllCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user.data;
    const { start, page_size, keywords } = req.query as {
      start: string;
      page_size: string;
      keywords: string;
    };

    if (role !== 'ADMIN') {
      return next(createError('User is not ADMIN', 200));
    }

    // Retrieve total count of records

    const whereCustomer = {
      OR: [
        {
          firstName: {
            contains: keywords,
          },
        },
        {
          lastName: {
            contains: keywords,
          },
        },
      ],
    };
    const result = await prisma.customer.findMany({
      skip: (Number(start) - 1) * Number(page_size),
      take: Number(page_size),
      where: whereCustomer,
      select: {
        id: true,
        imgProfile: true,
        firstName: true,
        lastName: true,
        cardId: true,
        role: true,
        phoneNumber: true,
        houseNumber: true,
        address: true,
        isActive: true,
        zoneId: true,
        zone: {
          select: {
            id: true,
            zoneName: true,
          },
        },
        prefixId: true,
        prefix: {
          select: {
            id: true,
            prefixName: true,
          },
        },
      },
    });

    const total_record = await prisma.customer.count({
      where: whereCustomer,
    });

    res.status(200).json({ message: 'ok', data: result, total_record: total_record });
  } catch (error) {
    next(error);
  }
};

export const getByIdCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.query as { id: string };

    const result = await prisma.customer.findUnique({
      where: {
        id: id,
      },
    });

    if (!result) return next(createError('customerId is empty', 400));

    res.status(200).json({ message: 'ok', data: result });
  } catch (error) {
    console.error('Get by customerId failed', 400);
    return next(error);
  }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user.data;
    const { data, error } = updateCustomerSchema.safeParse(req.body);

    if (error) return next(createError(error.message, 401));

    if (role !== 'ADMIN') {
      return next(createError('User is not ADMIN', 401));
    }

    const result = await prisma.customer.update({
      where: {
        id: data.id,
      },
      data: {
        cardId: data.cardId,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        houseNumber: data.houseNumber,
        address: data.address,
        zoneId: data.zoneId,
        prefixId: data.prefixId,
      },
    });

    res.status(201).json({ message: 'ok', data: result });
  } catch (error) {
    console.error('Update customer failed', error);
    return next(error);
  }
};

export const deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.body as { id: string };

    const result = await prisma.customer.delete({
      where: {
        id,
      },
    });

    // console.log(result);

    if (!result) return next(createError('Customer not found', 404));

    res.status(200).json({ message: 'ok', data: result });
  } catch (error) {
    console.error('Delete Customer failed', 500);
    return next(error);
  }
};

export const uploadProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.body as { id: string };
    const { folder } = req.params;
    // console.log('typeFile=>', typeFile);
    let filePath = '';
    if (!req.file) return next(createError('Image is requied', 400));

    if (req.file) {
      // cloudinary
      // imgProfile = await upload(req.file.path);

      // local
      filePath = `public/images/${folder}/${req.file.filename}`;
    }

    const result = await prisma.customer.update({
      where: {
        id: id,
      },
      data: {
        imgProfile: filePath,
      },
    });

    res.status(201).json({ message: 'Upload Profile', data: result });
  } catch (error) {
    console.error(error);
    return next(error);
  }
  // finally {
  //   if (req.file) {
  //     fs.unlink(req.file.path);
  //   }
  // }
};
