import { Router } from "express";
import CommentsService from "./comments.service";
import {
  authentication,
  authorization,
} from "../../middlewares/Auth/authentication.middleware";
import { TokenTypeEnum, UserRole } from "../../utils/enums/User.enums";
import { validation } from "../../middlewares/Auth/validation.middleware";
import { createCommentSchema } from "./comments.validation";
const router: Router = Router({ mergeParams: true });

router.post(
  "/",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [UserRole.ADMIN, UserRole.USER] }),
  validation(createCommentSchema),
  CommentsService.createComment,
);
router.get("/:postId", CommentsService.getCommentsByPostId);
router.patch(
  "/update/:commentId",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [UserRole.ADMIN, UserRole.USER] }),
  validation(createCommentSchema),
  CommentsService.updateComment,
);
router.patch(
  "/soft-delete/:commentId",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [UserRole.ADMIN, UserRole.USER] }),
  CommentsService.deleteComment,
);
router.patch('/:commentId/react',
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [UserRole.ADMIN, UserRole.USER] }),
  CommentsService.reactToComment,
);
export default router;
