import { Response, Request, NextFunction } from "express";

interface IError {
	statusCode?: number;
	message?: string;
}

const error = (
	err: IError,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	res.status(err.statusCode || 500).json({ message: err.message });
};

export default error;
