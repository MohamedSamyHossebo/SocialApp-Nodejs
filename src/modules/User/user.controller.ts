import { Router } from "express";
import { Request, Response } from "express";
import { authentication } from "../../middlewares/Auth/authentication.middleware";
import { TokenTypeEnum } from "../../utils/enums/User.enums";
import { userService } from "./user.service";
const router: Router = Router();

router.get(
  "/profile",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  userService.getProfile,
);

export default router;
