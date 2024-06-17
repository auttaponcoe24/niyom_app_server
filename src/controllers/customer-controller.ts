import prisma from "@/models/prisma";
import { NextFunction, Request, Response } from "express";

const create_customer = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const {} = req.body;

		const customer = await prisma.customer.create({
			data: req.body,
		});
	} catch (error) {
		next(error);
	}
};
