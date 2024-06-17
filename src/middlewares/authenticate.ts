import jwt, { JwtPayload } from "jsonwebtoken";
import prisma from "@/models/prisma";
import { NextFunction, Response, Request } from "express";
import createError from "@/utils/create-error";

interface IPayload extends JwtPayload {
	id: string;
	id_passpost: string;
	firstname: string;
	lastname: string;
}

const authMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const authorization = req.headers.authorization;
		if (!authorization) {
			return next(createError("unauthenticated", 401));
		}

		const token = authorization.split(" ")[1];
		const payload = jwt.verify(
			token,
			process.env.JWT_SECRET || "secretKeyRandom"
		) as IPayload;

		// const { id_passpost } = payload;

		const user = await prisma.user.findUnique({
			where: {
				id_passpost: payload.id_passpost,
			},
		});

		if (!user) {
			return next(createError("unauthenticated", 401));
		}

		delete user.password;
		req.user = user;
		next();
	} catch (error) {
		if (error.name === "TokenExpiredError" || "JsonWebTokenError") {
			error.statusCode = 401;
		}
		next(error);
	}
};

export default authMiddleware;
