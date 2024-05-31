import "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";

const app = express();

app.use(express.json());

app.get("/", async (req: Request, res: Response) => {
	const test: string = "Hello world";
	res.json({ message: test });
});

// app.use('/auth', )

const PORT = process.env.PORT || "8801";
app.listen(PORT, () => console.log(`Server is run on PORT: ${PORT}`));
