import { NextFunction, Request, Response } from 'express';
import prisma from '../models/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import createError from '@/utils/create-error';
import { loginSchema, registerSchema, updateProfileSchema } from '@/validators/auth.validator';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // รับข้อมูลจากฟอร์มการลงทะเบียน
    const { firstname, lastname, card_id, email, password, confirmPassword } = req.body;
    const { value, error } = registerSchema.validate({ firstname, lastname, card_id, email, password, confirmPassword });

    if (error) {
      return next(createError(error.message, 401));
    }

    // if (password !== confirmPassword) {
    //   return next(createError('Password does not match Confirm Password', 401));
    // }

    const customer = await prisma.customer.findUnique({
      where: {
        card_id: value.card_id,
      },
    });

    // Hash the password
    const hashPassword = await bcrypt.hash(value.password, 12);

    // Create the user in the database
    const newUser = await prisma.user.create({
      data: {
        firstname: value.firstname,
        lastname: value.lastname,
        card_id: value.card_id,
        email: value.email,
        password: hashPassword,
        customerId: !!customer ? customer.id : null,
      },
    });

    // Send a response back to the client
    res.status(201).json({
      message: 'User registered successfully',
      result: newUser,
    });
  } catch (error) {
    console.error('Error in registration:', error);
    return next(error); // Pass errors to the error handler middleware
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const { value, error } = loginSchema.validate({ email, password });

    if (error) {
      return next(createError(error.message, 400));
    }

    // Validate email and password
    // if (!email || !password) {
    //   return next(createError('Email and password are required', 400));
    // }

    const user = await prisma.user.findUnique({
      where: {
        email: value.email,
      },
    });

    if (!user) {
      return next(createError('Invalid email or password', 400));
    }

    const isMatch = await bcrypt.compare(value.password, user.password);
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
      result: userWithoutPassword,
      token: accessToken,
    });
  } catch (error) {
    console.error('Error during login:', error);
    return next(error);
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
    const { firstname, lastname, card_id } = req.body;
    const { value, error } = updateProfileSchema.validate({ firstname, lastname, card_id });

    if (error) {
      return next(createError(error.message, 401));
    }

    const user = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        firstname: value.firstname,
        lastname: value.lastname,
        card_id: value.card_id,
      },
    });

    const { password: _, ...userWithOutPassword } = user;

    res.status(201).json({ message: 'Update profile successfully', result: userWithOutPassword });
  } catch (error) {
    console.error('Update Profile Failed:', error);
    next(error);
  }
};

export const getUserAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user.result;

    if (role !== 'ADMIN') {
      return next(createError('User is not ADMIN', 404));
    }

    const userAll = await prisma.user.findMany({
      where: {
        role: 'USER',
      },
    });

    const total_record = await prisma.user.count({
      where: {
        role: 'USER',
      },
    });

    res.status(200).json({ message: 'Get users successfully', result: userAll, total_record });
  } catch (error) {
    console.log('Get users failed: ', error);
    return next(error);
  }
};
