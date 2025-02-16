import prisma from '@/models/prisma';
import upload from '@/utils/cloudinary-service';
import createError from '@/utils/create-error';
import { createCustomerSchema, updateCustomerSchema } from '@/validators/customer.validator';
import { NextFunction, Request, Response } from 'express';
import * as fs from 'fs/promises';

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user.data;
    // const { data, error } = createCustomerSchema.safeParse(req.body);

    // if (error) {
    //   return next(createError(error.message, 401));
    // }

    const data = req.body as {
      prefixId?: number;
      no?: number;
      firstName?: string;
      lastName?: string;
      cardId?: string;
      phoneNumber?: string;
      houseNumber?: string;
      isServiceWater: boolean;
      isServiceElectric: boolean;
      address?: string;
      zoneId?: number;
    };

    if (role !== 'ADMIN') {
      return next(createError('User is not admin', 500));
    }

    const checkCardId = data.cardId
      ? {
          ...data,
        }
      : {
          no: data.no,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          houseNumber: data.houseNumber,
          address: data.address,
          isServiceWater: data.isServiceWater,
          isServiceElectric: data.isServiceElectric,
          prefixId: data.prefixId,
          zoneId: data.zoneId,
        };

    const customer = await prisma.customer.create({
      data: {
        ...checkCardId,
      },
    });

    // ดึงลูกค้าทั้งหมดที่มี `no` มากกว่าหรือเท่ากับที่เพิ่มใหม่
    const filterCustomers = await prisma.customer.findMany({
      where: {
        no: { gte: customer.no }, // ดึง `no` ที่มากกว่าหรือเท่ากับ customer.no
        id: { not: customer.id }, // ต้องไม่ใช่ ID ของตัวที่เพิ่งสร้าง
        zoneId: customer.zoneId,
      },
      orderBy: { no: 'asc' },
    });

    // อัปเดตหมายเลข `no` แบบ batch
    if (filterCustomers.length > 0) {
      const updatePromises = filterCustomers.map((cus, index) =>
        prisma.customer.update({
          where: { id: cus.id },
          data: { no: customer.no + (index + 1) },
        }),
      );
      await Promise.all(updatePromises);
    }

    res.status(201).json({ message: 'ok', data: customer });
  } catch (error) {
    console.error('Create customer failed:', error);
    return next(error);
  }
};

export const getAllCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user.data;
    const { start, pageSize, keywords, zoneId } = req.query as {
      start: string;
      pageSize: string;
      keywords: string;
      zoneId: string;
    };

    if (role !== 'ADMIN') {
      return next(createError('User is not admin', 400));
    }

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
        {
          id: {
            contains: keywords,
          },
        },
      ],
      zoneId: zoneId ? +zoneId : {},
    };
    const result = await prisma.customer.findMany({
      skip: (Number(start) - 1) * Number(pageSize),
      take: Number(pageSize),
      where: { ...whereCustomer },
      orderBy: [{ zoneId: 'asc' }, { no: 'asc' }],
      select: {
        id: true,
        no: true,
        firstName: true,
        lastName: true,
        cardId: true,
        phoneNumber: true,
        houseNumber: true,
        address: true,
        isActive: true,
        isServiceWater: true,
        isServiceElectric: true,
        zone: {
          select: {
            id: true,
            zoneName: true,
          },
        },
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
      select: {
        id: true,
        no: true,
        firstName: true,
        lastName: true,
        cardId: true,
        phoneNumber: true,
        houseNumber: true,
        address: true,
        isActive: true,
        isServiceWater: true,
        isServiceElectric: true,
        zone: {
          select: {
            id: true,
            zoneName: true,
          },
        },
        prefix: {
          select: {
            id: true,
            prefixName: true,
          },
        },
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
    // const { data, error } = updateCustomerSchema.safeParse(req.body);

    // if (error) return next(createError(error.message, 401));

    const data = req.body as {
      id?: string;
      no?: number;
      firstName?: string;
      lastName?: string;
      cardId?: string;
      phoneNumber?: string;
      houseNumber?: string;
      address?: string;
      isActive: boolean;
      isServiceWater: boolean;
      isServiceElectric: boolean;
      prefixId?: number;
      zoneId?: number;
    };

    if (role !== 'ADMIN') {
      return next(createError('User is not ADMIN', 401));
    }

    // ดึงข้อมูลเดิมก่อนอัปเดต
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: data.id },
      select: { no: true },
    });

    if (!existingCustomer) {
      return next(createError('customer is not found', 404));
    }

    const checkCardId = data.cardId
      ? {
          ...data,
        }
      : {
          id: data.id,
          no: data.no,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          houseNumber: data.houseNumber,
          address: data.address,
          isActive: data.isActive,
          isServiceWater: data.isServiceWater,
          isServiceElectric: data.isServiceElectric,
          prefixId: data.prefixId,
          zoneId: data.zoneId,
        };

    // อัปเดตข้อมูลลูกค้า
    const customer = await prisma.customer.update({
      where: { id: data.id },
      data: { ...checkCardId },
    });

    // หาก `no` มีการเปลี่ยนแปลง ค่อยอัปเดตลำดับ
    if (customer.no !== existingCustomer.no) {
      const filterCustomers = await prisma.customer.findMany({
        where: {
          no: { gte: customer.no },
          id: { not: customer.id },
          zoneId: customer.zoneId,
        },
        orderBy: { no: 'asc' },
      });

      if (filterCustomers.length > 0) {
        const updatePromises = filterCustomers.map((cus, index) =>
          prisma.customer.update({
            where: { id: cus.id },
            data: { no: customer.no + (index + 1) },
          }),
        );
        await Promise.all(updatePromises);
      }
    }

    res.status(200).json({ message: 'ok', data: customer });
  } catch (error) {
    console.error('Update customer failed:', error);
    return next(error);
  }
};

export const activeCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, isActive } = req.body as { id: string; isActive: boolean };

    const result = await prisma.customer.update({
      where: {
        id: id,
      },
      data: {
        isActive: isActive,
      },
    });

    res.status(201).json({ status: true, message: `customer change active is : ${isActive}`, data: result });
  } catch (error) {
    console.error(error);
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
