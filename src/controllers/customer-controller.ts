import { ICustomer } from "@/interfaces/customer-interface";
import prisma from "@/models/prisma";
import createError from "@/utils/create-error";
import { NextFunction, Request, Response } from "express";

export const createCustomer = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { role } = req.user;

		if (role !== "OWNER") {
			return next(createError("Is not Owner", 401));
		}

		const values: ICustomer = req.body;

		const result = await prisma.customer.create({
			data: values,
		});

		res.status(201).json({ message: "ok", result });
	} catch (error) {
		next(error);
	}
};

export const getAllCustomer = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { role } = req.user;

		if (role !== "OWNER") {
			return next(createError("Is not owner", 200));
		}

		const result = await prisma.customer.findMany({
			include: {
				zone: true,
			},
		});

		res.status(200).json({ message: "ok", result });
	} catch (error) {
		next(error);
	}
};

export const editCustomer = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { role } = req.user;
		const { customerId } = req.query;
		const {
			id_passpost,
			firstname,
			lastname,
			phone_number,
			house_number,
			address,
			zoneId,
		} = req.body;

		if (role !== "OWNER") {
			return next(createError("Is not owner", 401));
		}

		const findCustomer = await prisma.customer.findUnique({
			where: {
				id: Number(customerId),
			},
		});

		const customer = await prisma.customer.update({
			where: {
				id: findCustomer.id,
			},
			data: {
				id_passpost,
				firstname,
				lastname,
				phone_number,
				house_number,
				address,
				zoneId,
			},
		});
		res.status(201).json({ message: "ok", customer });
	} catch (error) {
		next(error);
	}
};
