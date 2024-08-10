import jwt, { JwtPayload } from 'jsonwebtoken';
import prisma from '@/models/prisma';
import { NextFunction, Response, Request } from 'express';
import createError from '@/utils/create-error';

interface IPayload extends JwtPayload {
  id: string;
  email: string;
  role: 'OWNER' | 'CUSTOMER';
}

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization) {
      return next(createError('unauthenticated', 400));
    }

    const token = authorization.split(' ')[1];

    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY || 'secretKeyRandom') as IPayload;

    const user = await prisma.user.findUnique({
      where: {
        id: payload.id,
      },
    });

    if (!user) {
      return next(createError('unauthenticated', 400));
    }

    delete user.password;

    req.user = { result: user, token };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError' || 'JsonWebTokenError') {
      error.statusCode = 401;
    }
    next(error);
  }
};

export default authMiddleware;
