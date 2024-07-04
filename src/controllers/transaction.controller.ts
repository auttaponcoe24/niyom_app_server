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
		} as any;

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

		// Find over_due from previous month
		let previousMonth = String(Number(month) - 1);
		let previousYear = year;

		if (Number(month) === 1) {
			previousMonth = "12";
			previousYear = String(Number(year) - 1);
		} else if (previousMonth.length === 1) {
			previousMonth = "0" + previousMonth; // Add leading zero for single digit months
		}

		const overDueTransaction = await prisma.transaction.findFirst({
			where: {
				month: previousMonth,
				year: previousYear,
				customerId: customerId,
			},
			select: {
				CalculateTransactions: true,
			},
			orderBy: {
				updateAt: "desc",
			},
		});

		// console.log("overDueTransaction", overDueTransaction);

		// Set over_due value if found
		if (overDueTransaction && overDueTransaction.CalculateTransactions) {
			resultCal.over_due =
				overDueTransaction.CalculateTransactions[0].total_price;
		}

		// Calculate total price
		resultCal.total_price =
			Number(resultCal.price) + Number(resultCal.over_due);

		// Create the calculateTransaction
		const calculateTransaction = await prisma.calculateTransaction.create({
			data: {
				price: resultCal.price,
				over_due: resultCal.over_due,
				total_price: resultCal.total_price,
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
			orderBy: {
				createAt: "desc",
			},
		});

		res.status(200).json({ message: "ok", result });
	} catch (error) {
		next(error);
	}
};
