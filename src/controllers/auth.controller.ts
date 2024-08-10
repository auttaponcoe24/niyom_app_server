import { NextFunction, Request, Response } from 'express';
import prisma from '../models/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import createError from '@/utils/create-error';
import { editProfileSchema, loginSchema, registerSchema } from '@/validators/auth.validator';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // รับข้อมูลจากฟอร์มการลงทะเบียน
    const { email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return next(createError('Password does not match Confirm Password', 401));
    }

    // Hash the password
    const hashPassword = await bcrypt.hash(password, 12);

    // Create the user in the database
    const result = await prisma.user.create({
      data: {
        email: email,
        password: hashPassword,
      },
    });

    // Send a response back to the client
    res.status(201).json({
      message: 'User registered successfully',
      result: result,
    });
  } catch (error) {
    console.error('Error in registration:', error);
    return next(error); // Pass errors to the error handler middleware
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return next(createError('Email and password are required', 400));
    }

    const result = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!result) {
      return next(createError('Invalid email or password', 400));
    }

    const isMatch = await bcrypt.compare(password, result.password);
    if (!isMatch) {
      return next(createError('Invalid email or password', 400));
    }

    const payload = {
      id: result.id,
      email: result.email,
      role: result.role,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET_KEY || 'secretKeyRandom', { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });

    delete result.password;

    res.status(200).json({
      message: 'Login successfully',
      result: result,
      token: accessToken,
    });
  } catch (error) {
    console.error('Error during login:', error);
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({ message: 'Get Profile', result: req?.user?.result, token: req?.user?.token });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user.result;
    const { firstname, lastname, id_passpost, address } = req.body;

    const result = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        firstname,
        lastname,
        id_passpost,
        address,
        status: !!id_passpost ? 'SUCCESS' : 'PENDING',
      },
    });

    res.status(201).json({ message: 'Update profile successfully', result: result });
  } catch (error) {
    console.error('Update Profile Failed:', error);
    next(error);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user.result;
    const { id, status } = req.query;

    if (role !== 'ADMIN') {
      return next(createError('User is not ADMIN', 401));
    }

    const result = await prisma.user.update({
      where: {
        id: id as string,
      },
      data: {
        status: status as any,
      },
    });

    res.status(201).json({ message: 'Update status successfully', result: result });
  } catch (error) {
    console.error('Update status Failed:', error);
    next(error);
  }
};

export const getUserAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req?.user?.result?.role !== 'ADMIN') {
      return next(createError('User is not ADMIN', 400));
    }
    const result = await prisma.user.findMany({
      where: {
        role: 'USER',
      },
    });

    res.status(200).json({ message: 'Get users successfully', result: result, total_record: result.length });
  } catch (error) {
    console.log('Get users failed: ', error);

    next(error);
  }
};
