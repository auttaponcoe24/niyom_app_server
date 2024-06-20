import { TZone } from "@/interfaces/zone-interface";
import prisma from "@/models/prisma";
import createError from "@/utils/create-error";
import { NextFunction, Response, Request } from "express";

export const createZone = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { role } = req.user;

		const values: TZone = req.body;
		// const { zone_name } = req.body;

		if (role !== "OWNER") {
			return next(createError("Is Not Owner", 401));
		}

		const result = await prisma.zone.create({
			data: values,
		});

		res.status(201).json({ message: "ok", zone: result });
	} catch (error) {
		next(error);
	}
};

export const getZone = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { role } = req.user;

		if (role !== "OWNER") {
			return next(createError("Is not owner", 201));
		}

		const result = await prisma.zone.findMany();
		res.status(200).json({ message: "ok", result });
	} catch (error) {
		next(error);
	}
};
