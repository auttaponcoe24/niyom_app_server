import { NextFunction, Request, Response } from "express";
import prisma from "../models/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { registerSchema } from "@/validators/auth-validator";
import { IUser } from "@/interfaces/user-interface";

export const register = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { value, error }: { value: IUser; error: any } =
			registerSchema.validate(req.body);

		if (error) {
			error.statusCode = 401;
			return next(error);
		}

		// Hash the password
		value.address = await bcrypt.hash(value.password, 12);

		// Create the user in the database
		const data = await prisma.user.create({
			data: value,
		});
		const payload = {
			id: data.id,
			id_passpost: data.id_passpost,
			firstname: data.firstname,
			lastname: data.lastname,
		};

		const accessToken = jwt.sign(
			payload,
			process.env.JWT_SECREY || "secretKeyRandom",
			{ expiresIn: process.env.JWT_EXPIRE || "30d" }
		);

		delete data.password;
		// Send a response back to the client
		res.status(201).json({
			message: "User created successfully",
			user: data,
			accessToken: accessToken,
		});
	} catch (error) {
		next(error); // Pass errors to the error handler middleware
	}
};
