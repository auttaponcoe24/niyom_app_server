import { NextFunction, Request, Response } from "express";
import prisma from "../models/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { loginSchema, registerSchema } from "@/validators/auth-validator";
import { IUser } from "@/interfaces/user-interface";
import createError from "@/utils/create-error";
import Joi from "joi";

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
		value.password = await bcrypt.hash(value.password, 12);

		// Create the user in the database
		const data = await prisma.user.create({
			data: value,
		});
		const payload = {
			id: data.id,
			id_passpost: data.id_passpost,
			firstname: data.firstname,
			lastname: data.lastname,
			role: data.role,
		};

		const accessToken = jwt.sign(
			payload,
			process.env.JWT_SECREY_KEY || "secretKeyRandom",
			{ expiresIn: process.env.JWT_EXPIRES_IN || "30d" }
		);

		delete data.password;
		// Send a response back to the client
		res.status(201).json({
			message: "ok",
			user: data,
			accessToken: accessToken,
		});
	} catch (error) {
		next(error); // Pass errors to the error handler middleware
	}
};

export const login = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const {
			value,
			error,
		}: {
			value: {
				email: string;
				password: string;
			};
			error: Joi.ValidationError;
		} = loginSchema.validate(req.body);

		if (error) {
			return next(createError("email incorrect or password incorrect", 400));
		}

		const user = await prisma.user.findUnique({
			where: {
				email: value.email,
			},
		});

		if (!user) {
			return next(createError("mail is not found", 400));
		}

		const isMatch = await bcrypt.compare(value.password, user.password);
		if (!isMatch) {
			return next(createError("password incorrect", 400));
		}

		const payload = {
			id: user.id,
			id_passpost: user.id_passpost,
			firstname: user.firstname,
			lastname: user.lastname,
			role: user.role,
		};

		const accessToken = jwt.sign(
			payload,
			process.env.JWT_SECRET_KEY || "secretKeyRandom",
			{ expiresIn: process.env.JWT_EXPIRES_IN || "30d" }
		);

		delete user.password;

		res.status(200).json({
			message: "ok",
			user: user,
			accessToken: accessToken,
		});
	} catch (error) {
		next(error);
	}
};

export const getProfile = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		res.status(200).json({ message: "ok", user: req.user });
	} catch (error) {
		next(error);
	}
};
