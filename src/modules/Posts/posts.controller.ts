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
router.get("/",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [UserRole.ADMIN, UserRole.USER] }),
  PostsService.getAllPosts
);
router.patch('/update/:postId',
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [UserRole.ADMIN, UserRole.USER] }),
  validation(postValidation.updatePostSchema),
  PostsService.updatePost
)
router.patch(
  "/:postId/react",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [UserRole.ADMIN, UserRole.USER] }),
  validation(postValidation.reactToPostSchema),
  PostsService.react,
);
router.patch("/soft-delete/:postId",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [UserRole.ADMIN, UserRole.USER] }),
  PostsService.deletePost
);

export default router;
