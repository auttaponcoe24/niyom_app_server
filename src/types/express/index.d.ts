// src/types/express/index.d.ts
import { RoleUser, User } from '@prisma/client';

declare module 'express-serve-static-core' {
  interface Request {
    // user?: { data: any; accessToken: string };
    // user?: { data: User & { password?: string }; accessToken: string };
    user?: {
      data: {
        id: string;
        firstName: string;
        lastName: string;
        cardId: string;
        email: string;
        role: RoleUser;
        customerId: string;
        createdAt: Date;
        updatedAt: Date;
      };
      accessToken: string;
    };
  }
}
