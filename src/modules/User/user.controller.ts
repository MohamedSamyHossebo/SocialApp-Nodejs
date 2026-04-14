import { Router } from "express";
import UserService from "./user.service";
import { Request, Response } from "express";
const router: Router = Router();

router.get("/", (req: Request, res: Response) => {
  return res.success({ message: "Hello, World!", statusCode: 200 });
});

export default router;
