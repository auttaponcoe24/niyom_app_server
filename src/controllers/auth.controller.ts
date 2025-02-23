import { NextFunction, Request, Response } from 'express';
import prisma from '../models/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import createError from '@/utils/create-error';
import { responseSuccess } from '@/utils/handleResponse';
import { loginSchema, registerSchema } from '@/validators/auth.validator';
import { User, RoleUser } from '@prisma/client';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // รับข้อมูลจากฟอร์มการลงทะเบียน
    // const { data, error } = registerSchema.safeParse(req.body);

    // if (error) {
    //   return next(createError(error.message, 401));
    // }

    const data = req.body as {
      firstName?: string;
      lastName?: string;
      cardId?: string;
      email: string;
      password: string;
    };

    // Hash the password
    const hashPassword = await bcrypt.hash(data.password, 12);

    // Create the user in the database
    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashPassword,
      },
    });

    // Send a response back to the client
    // res.status(201).json({
    //   message: 'User registered successfully',
    //   data: newUser,
    // });

    res.status(201).json(responseSuccess(user, 'Register Successfully'));
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

    // const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'secretKeyRandom', { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });

    const { accessToken } = await generateTokens(user);
    // delete user.password;
    // Exclude sensitive fields from user response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'Login successfully',
      data: userWithoutPassword,
      accessToken: accessToken,
    });
  } catch (error) {
    console.error('Error during login:', error);
    return next(error);
  }
};

const generateTokens = async (users: User) => {
  const payload = {
    id: users.id,
    email: users.email,
    role: users.role,
  };

  const [accessToken, refreshToken] = await Promise.all([
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN }),
    jwt.sign(payload, process.env.REFRESH_JWT_SECRET, { expiresIn: process.env.REFRESH_JWT_EXPIRES_IN }),
  ]);

  return { accessToken, refreshToken };
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, accessToken } = req.user;
    res.status(200).json({ message: 'Get Profile', data, accessToken });
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
    const { start, pageSize, keywords } = req.query;

    if (role !== 'ADMIN') {
      return next(createError('User is not ADMIN', 404));
    }

    const whereUser = {
      role: 'USER' as RoleUser,
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
    };

    const userAll = await prisma.user.findMany({
      take: Number(pageSize),
      skip: (Number(start) - 1) * Number(pageSize),
      where: { ...whereUser },
    });

    const total_record = await prisma.user.count({
      where: { ...whereUser },
    });

    res.status(200).json({ message: 'Get users successfully', data: userAll, total_record });
  } catch (error) {
    console.log('Get users failed: ', error);
    return next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user.data;
    const values = req.body as {
      password: string;
      newPassword: string;
    };

    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!user) return next(createError('User not found', 404));

    // เปรียบเทียบรหัสผ่านเดิม
    const isCheckPassword = await bcrypt.compare(values.password, user.password);

    if (!isCheckPassword) {
      // ถ้ารหัสผ่านเดิมไม่ถูกต้องให้ส่ง error กลับไป
      return next(createError('Invalid password', 401));
    }

    // รหัสผ่านเดิมถูกต้อง สามารถดำเนินการเปลี่ยนรหัสผ่านใหม่ได้
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: {
        password: await bcrypt.hash(values.newPassword, 10), // แฮชรหัสผ่านใหม่
      },
    });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
