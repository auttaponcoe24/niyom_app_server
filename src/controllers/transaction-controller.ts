import prisma from "@/models/prisma";
import { NextFunction, Request, Response } from "express";

export const createTransaction = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const {
			month,
			year,
			unit_old_date,
			unit_new_date,
			type,
			zoneId,
			paymentId,
			customerId,
		} = req.body;

		const transaction = await prisma.transaction.create({
			data: {
				month,
				year,
				unit_old_date,
				unit_new_date,
				type,
				zoneId,
				paymentId,
				customerId,
			},
		});

		let resultCal = {
			price: 0,
			total_price: 0,
			over_due: 0,
		};

		if (transaction.type === "W") {
			resultCal.price =
				(transaction.unit_new_date - transaction.unit_old_date) * 16 + 50;
		} else if (transaction.type === "E") {
			resultCal.price =
				(transaction.unit_new_date - transaction.unit_old_date) * 6 + 50;
		}

		const calculateTransaction = await prisma.calculateTransaction.create({
			data: {
				price: resultCal.price,
				total_price: resultCal.total_price,
				over_due: resultCal.over_due,
				transactionId: transaction.id,
			},
		});

		res.status(201).json({ message: "ok", transaction, calculateTransaction });
	} catch (error) {
		next(error);
	}
};

export const getTransaction = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const result = await prisma.transaction.findMany({
			include: {
				customer: true,
				CalculateTransactions: true,
			},
		});

		res.status(200).json({ message: "ok", result });
	} catch (error) {
		next(error);
	}
};
