import { Router } from "express";
import PostsService from "./posts.service";
import {
  authentication,
  authorization,
} from "../../middlewares/Auth/authentication.middleware";
import { TokenTypeEnum, UserRole } from "../../utils/enums/User.enums";
import * as postValidation from "./posts.validation";
import { validation } from "../../middlewares/Auth/validation.middleware";
const router: Router = Router();
router.post(
  "/",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [UserRole.ADMIN, UserRole.USER] }),
  validation(postValidation.createPostSchema),
  PostsService.createPost,
);
export default router;
