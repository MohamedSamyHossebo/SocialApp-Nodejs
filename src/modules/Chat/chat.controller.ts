import { Router } from "express";
import { validation } from "../../middlewares/Auth/validation.middleware";
import {
  authentication,
  authorization,
} from "../../middlewares/Auth/authentication.middleware";
import { TokenTypeEnum, UserRole } from "../../utils/enums/User.enums";
import * as Validators from "./chat.validation";
import chatService from "./chat.service";
const router: Router = Router({ mergeParams: true });

router.get(
  "/",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [UserRole.USER, UserRole.ADMIN] }),
  validation(Validators.getChatSchema),
  chatService.getChat,
);
export default router;
