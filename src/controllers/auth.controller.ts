import { NextFunction, Request, Response } from 'express';
import prisma from '../models/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import createError from '@/utils/create-error';
import { loginSchema, registerSchema } from '@/validators/auth.validator';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // รับข้อมูลจากฟอร์มการลงทะเบียน
    const { data, error } = registerSchema.safeParse(req.body);

    if (error) {
      return next(createError(error.message, 401));
    }
    // if (password !== confirmPassword) {
    //   return next(createError('Password does not match Confirm Password', 401));
    // }

    // Hash the password
    const hashPassword = await bcrypt.hash(data.password, 12);

    // Create the user in the database
    const newUser = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        cardId: data.cardId,
        email: data.email,
        password: hashPassword,
      },
    });

    // Send a response back to the client
    res.status(201).json({
      message: 'User registered successfully',
      data: newUser,
    });
  } catch (error) {
    console.error('Error in registration:', error);
    return next(error); // Pass errors to the error handler middleware
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = loginSchema.safeParse(req.body);

    if (error) {
      return next(createError(error.message, 400));
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          {
            email: data.emailOrCardId,
          },
          {
            cardId: data.emailOrCardId,
          },
        ],
      },
    });

    if (!user) {
      return next(createError('User is not found', 400));
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      return next(createError('Invalid email or password', 400));
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET_KEY || 'secretKeyRandom', { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });

    // delete user.password;
    // Exclude sensitive fields from user response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: 'Login successfully',
      data: userWithoutPassword,
      token: accessToken,
    });
  } catch (error) {
    console.error('Error during login:', error);
    return next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, token } = req.user;
    res.status(200).json({ message: 'Get Profile', data, token: token });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user.data;
    const { firstName, lastName, cardId, customerId } = req.body;

    // if (error) {
    //   return next(createError(error.message, 401));
    // }

    // สร้างวัตถุใหม่เฉพาะฟิลด์ที่มีค่าเท่านั้น
    const updateData: Partial<typeof req.body> = {};

    if (!!firstName) updateData.firstName = firstName;
    if (!!lastName) updateData.lastName = lastName;
    if (!!cardId) updateData.cardId = cardId;
    if (!!customerId) updateData.customerId = customerId;

    const user = await prisma.user.update({
      where: {
        id: id,
      },
      // data: {
      //   firstName,
      //   lastName,
      //   cardId,
      //   customerId,
      // },
      data: updateData, // ใช้เฉพาะฟิลด์ที่มีค่า เพื่อกันค่าที่ไม่ได้ส่งไปต้องไปอัพเดท
    });

    const { password: _, ...userWithOutPassword } = user;

    res.status(201).json({ message: 'Update profile successfully', data: userWithOutPassword });
  } catch (error) {
    console.error('Update Profile Failed:', error);
    next(error);
  }
};

export const getUserAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user.data;
    const { start, page_size, keywords } = req.query;

    if (role !== 'ADMIN') {
      return next(createError('User is not ADMIN', 404));
    }

    const userAll = await prisma.user.findMany({
      take: Number(page_size),
      skip: (Number(start) - 1) * Number(page_size),
      where: {
        role: 'USER',
        OR: [
          {
            firstName: {
              contains: String(keywords),
            },
          },
          {
            lastName: {
              contains: String(keywords),
            },
          },
        ],
      },
    });

    const total_record = await prisma.user.count({
      where: {
        role: 'USER',
      },
    });

    res.status(200).json({ message: 'Get users successfully', data: userAll, total_record });
  } catch (error) {
    console.log('Get users failed: ', error);
    return next(error);
  }
};
