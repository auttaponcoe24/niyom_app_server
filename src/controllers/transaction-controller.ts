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
			over_due: 0,
			total_price: 0,
		};

		if (transaction.type === "W") {
			resultCal.price =
				(transaction.unit_new_date - transaction.unit_old_date) * 16 + 50;
		} else if (transaction.type === "E") {
			let a = (transaction.unit_new_date - transaction.unit_old_date) * 7 + 50;
			let b =
				((transaction.unit_new_date - transaction.unit_old_date) * 7 + 50) *
				0.07;
			// resultCal.price =
			// 	(transaction.unit_new_date - transaction.unit_old_date) * 7 + 50;
			resultCal.price = a + b;
		}

		// find ยอดค้าง
		let findOverDue;
		if (month === 1) {
			findOverDue = await prisma.transaction.findFirst({
				where: {
					AND: [
						{
							month: "12",
							year: String(year - 1),
						},
					],
				},
			});
		} else {
			findOverDue = await prisma.transaction.findFirst({
				where: {
					AND: [
						{
							month: String(month - 1),
							year: year,
						},
					],
				},
			});
			console.log("findOverDuey", findOverDue);
		}
		console.log("findOverDue", findOverDue);

		// const calculateTransaction = await prisma.calculateTransaction.create({
		// 	data: {
		// 		price: resultCal.price,
		// 		total_price: resultCal.total_price,
		// 		over_due: resultCal.over_due,
		// 		transactionId: transaction.id,
		// 	},
		// });

		// res.status(201).json({ message: "ok", transaction, calculateTransaction });
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
