import { Router } from "express";
import PostsService from "./posts.service";
import {
  authentication,
  authorization,
} from "../../middlewares/Auth/authentication.middleware";
import { TokenTypeEnum, UserRole } from "../../utils/enums/User.enums";
import * as postValidation from "./posts.validation";
import { validation } from "../../middlewares/Auth/validation.middleware";
import { commentsRouter } from "../Comments";
import postsService from "./posts.service";
import { schema } from "../graphql/schema.graphql";
import { createHandler } from "graphql-http/lib/use/express";
const router: Router = Router();
router.use("/:postId/comment", commentsRouter);

router.post(
  "/",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [UserRole.ADMIN, UserRole.USER] }),
  validation(postValidation.createPostSchema),
  PostsService.createPost,
);
router.post(
  "/graphql",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [UserRole.ADMIN, UserRole.USER] }),
  createHandler({
    schema: schema,
    context: (req: any) => ({
      user: req.raw.user,
      decodedToken: req.raw.decoded,
    }),
  }),
);
router.get(
  "/my-posts",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [UserRole.ADMIN, UserRole.USER] }),
  PostsService.getMyPosts,
);
router.patch(
  "/update/:postId",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [UserRole.ADMIN, UserRole.USER] }),
  validation(postValidation.updatePostSchema),
  PostsService.updatePost,
);
router.patch(
  "/:postId/react",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [UserRole.ADMIN, UserRole.USER] }),
  validation(postValidation.reactToPostSchema),
  PostsService.react,
);
router.patch(
  "/soft-delete/:postId",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [UserRole.ADMIN, UserRole.USER] }),
  PostsService.deletePost,
);

router.patch(
  "/restore-soft-delete/:postId",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [UserRole.ADMIN, UserRole.USER] }),
  PostsService.restoreSoftDeletePost,
);

router.delete(
  "/hard-delete/:postId",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [UserRole.ADMIN, UserRole.USER] }),
  postsService.hardDeletePost,
);
export default router;
