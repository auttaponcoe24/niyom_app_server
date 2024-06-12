import { NextFunction, Request, Response } from "express";
import prisma from "../models/prisma";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { firstname, lastname, address, id_passpost, mail, password } =
			req.body;

		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 12);

		// Create the user in the database
		const data = await prisma.user.create({
			data: {
				firstname,
				lastname,
				address,
				id_passpost,
				mail,
				password: hashedPassword, // Save the hashed password
			},
		});

		const payload = { userId: { id: data.id, id_passpost: data.id_passpost } };
		const accessToken = jwt.sign(
			payload,
			process.env.JWT_SECRET || "randowKey",
			{ expiresIn: process.env.JWT_EXPIRES_IN }
		);

		delete data.password;
		// Send a response back to the client
		res.status(201).json({ message: "User created successfully", user: data });
	} catch (error) {
		next(error); // Pass errors to the error handler middleware
	}
};
