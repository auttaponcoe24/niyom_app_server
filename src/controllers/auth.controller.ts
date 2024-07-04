import { NextFunction, Request, Response } from 'express';
import prisma from '../models/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import createError from '@/utils/create-error';
import { editProfileSchema, loginSchema, registerSchema } from '@/validators/auth.validator';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // รับข้อมูลจากฟอร์มการลงทะเบียน
    const { firstname, lastname, id_passport, address, email, password, confirmPassword, role, status } = req.body;

    // ตรวจสอบข้อมูลด้วย Joi
    const { error, value } = registerSchema.validate({
      firstname,
      lastname,
      id_passport,
      address,
      email,
      password,
      confirmPassword,
      role,
      status,
    });

    if (error) {
      // หากข้อมูลไม่ถูกต้อง ส่ง error กลับไปยัง client
      return res.status(400).json({ error: error.details[0].message });
    }

    // Hash the password
    const hashPassword = await bcrypt.hash(value.password, 12);

    // Create the user in the database
    const data = await prisma.user.create({
      data: {
        ...value,
        password: hashPassword,
      },
    });

    const payload = {
      id: data.id,
      id_passpost: data.id_passpost,
      firstname: data.firstname,
      lastname: data.lastname,
      role: data.role,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET_KEY || 'secretKeyRandom', { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });

    delete data.password;
    // Send a response back to the client
    res.status(201).json({
      message: 'ok',
      user: data,
      accessToken: accessToken,
    });
  } catch (error) {
    next(error); // Pass errors to the error handler middleware
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // ตรวจสอบข้อมูลด้วย Joi
    const { error, value } = loginSchema.validate({ email, password });

    if (error) {
      return next(createError(error.details[0].message as string, 400));
    }

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
      return next(createError('Invalid email or password', 401));
    }

    const payload = {
      id: user.id,
      id_passpost: user.id_passpost,
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET_KEY || 'secretKeyRandom', { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });

    delete user.password;

    res.status(200).json({
      message: 'ok',
      user: user,
      accessToken: accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({ message: 'ok', user: req.user });
  } catch (error) {
    next(error);
  }
};

export const editProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user;
    const { firstname, lastname, id_passpost, address, role, status } = req.body;

    const { error, value } = editProfileSchema.validate({ firstname, lastname, id_passpost, address, role, status });

    if (error) {
      return next(createError(error.details[0].message as string, 400));
    }

    const findUser = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        firstname: value.firstname,
        lastname: value.lastname,
        id_passpost: value.id_passpost,
        address: value.address,
        role: value.role,
        status: value.status,
      },
    });

    res.status(201).json({ message: 'ok', result: findUser });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await prisma.user.findMany({
      where: {
        role: 'USER',
      },
    });

    res.status(200).json({ message: 'ok', data: result, total_record: result.length });
  } catch (error) {
    next(error);
  }
};
