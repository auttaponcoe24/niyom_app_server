import { NextFunction, Request, Response } from 'express';
import prisma from '../models/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import createError from '@/utils/create-error';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Hash the password
    const hashPassword = await bcrypt.hash(password, 12);

    // Create the user in the database
    const data = await prisma.user.create({
      data: {
        email: email,
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

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return next(createError('mail is not found', 400));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(createError('password incorrect', 400));
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
    const { firstname, lastname, id_passpost, address } = req.body;

    const findUser = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        firstname,
        lastname,
        id_passpost,
        address,
      },
    });

    res.status(201).json({ message: 'ok', result: findUser });
  } catch (error) {
    next(error);
  }
};
