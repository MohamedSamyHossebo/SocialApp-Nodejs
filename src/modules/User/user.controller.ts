import { Router } from "express";
import { Request, Response } from "express";
import {
  authentication,
  authorization,
} from "../../middlewares/Auth/authentication.middleware";
import { TokenTypeEnum, UserRole } from "../../utils/enums/User.enums";
import { userService } from "./user.service";
import { validation } from "../../middlewares/Auth/validation.middleware";
import { UpdateProfileSchema } from "./user.validation";
const router: Router = Router();

router.get(
  "/profile",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  userService.getProfile,
);

router.patch(
  "/updateProfile",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [UserRole.USER, UserRole.ADMIN] }),
  validation(UpdateProfileSchema),
  userService.updateProfile,
);

router.patch(
  "/toggleFreezeAccount",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [UserRole.USER, UserRole.ADMIN] }),
  userService.toggleFreezeAccount,
);

export default router;
