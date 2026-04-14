import express from "express";
import { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";
import { authRouter, commentsRouter, postsRouter, userRouter } from "./modules";
import connectDB from "./DB/connection.db";
import { PORT } from "./config/config.service";
// rate
const lmiter: RateLimitRequestHandler = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 20,
    message: {
        statusCode: 429,
        message: "Too many requests, please try again later."
    }
})



export const bootstrap = async () => {
    const port: number | string = PORT; 
    const app: Express = express();
    await connectDB();
    app.use(express.json(), cors(), helmet(), lmiter);
    app.get("/", (req: Request, res: Response) => {
        return res.status(200).json({ message: "Hello, World!" });
    });
    app.use("/auth", authRouter);
    app.use("/comments", commentsRouter);
    app.use("/posts", postsRouter);
    app.use("/user", userRouter);

    app.use("*dummy", (req: Request, res: Response): Response => {
        return res.status(404).json({ message: "Route not found" });
    });

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });

}
