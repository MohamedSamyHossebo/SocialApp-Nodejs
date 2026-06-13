import express from "express";
import { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { authRouter, postsRouter, storiesRouter, userRouter } from "./modules";
import connectDB from "./DB/connection.db";
import { PORT } from "./config/config.service";
import {
  globalErrorHandler,
  NotFoundException,
} from "./middlewares/Error/ErrorHandler.middleware";
import { globalSuccessHandler } from "./middlewares/Success/SucessHandler.middleware";
import { corsOptions } from "./utils/cors/cors.utils";
import { rateLimiter } from "./utils/ratelimiter/rateLimiter.utils";
import connectRedis from "./DB/redis.connection.db";
import { Server } from "socket.io";
import { schema } from "./modules/graphql/index";
import { createHandler } from "graphql-http/lib/use/express";
import {
  authentication,
  authorization,
} from "./middlewares/Auth/authentication.middleware";
import { TokenTypeEnum, UserRole } from "./utils/enums/User.enums";
export const bootstrap = async () => {
  const port: number | string = PORT;
  const app: Express = express();
  await connectDB();
  await connectRedis();
  app.use(express.json(), cors(corsOptions), helmet(), rateLimiter);
  app.use(globalSuccessHandler);

  app.get("/", (req: Request, res: Response) => {
    return res.success({ message: "Hello, World!", statusCode: 200 });
  });

  app.all(
    "/graphql",
    authentication({ tokenType: TokenTypeEnum.ACCESS }),
    createHandler({
      schema: schema,
      context: (req) => ({ user: req.raw.user, decodedToken: req.raw.decoded }),
    }),
  );
  app.use("/auth", authRouter);
  app.use("/posts", postsRouter);
  app.use("/user", userRouter);
  app.use("/stories", storiesRouter);

  app.use(globalErrorHandler);
  app.use("*dummy", (req: Request, res: Response): Response => {
    throw new NotFoundException("Route not found", {});
  });

  const httpServer = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
};
