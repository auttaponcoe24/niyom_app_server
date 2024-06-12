import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";

import errorMiddlewares from "./middlewares/error";
import notFoundMiddlewares from "./middlewares/not-found";

import authRoute from "./routes/auth-route";

dotenv.config();
const app = express();
app.use(cors());

app.use(express.json());
app.use(morgan("dev"));

app.get("/", async (req: Request, res: Response) => {
	const test: string = "Hello world";
	res.json({ message: test });
});

app.use("/auth", authRoute);

app.use(notFoundMiddlewares);
app.use(errorMiddlewares);

const PORT = process.env.PORT || "8801";
app.listen(PORT, () => console.log(`Server is run on PORT: ${PORT}`));
