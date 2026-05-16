import { Router } from "express";
import { authentication, authorization } from "../../middlewares/Auth/authentication.middleware";
import { TokenTypeEnum, UserRole } from "../../utils/enums/User.enums";
import { validation } from "../../middlewares/Auth/validation.middleware";
import { storiesService } from "./stories.service";
import * as storiesValidation from "./stories.validation";

const router: Router = Router();

router.post(
  "/",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [UserRole.USER, UserRole.ADMIN] }),
  validation(storiesValidation.createStorySchema),
  storiesService.createStory,
);

router.get(
  "/",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [UserRole.USER, UserRole.ADMIN] }),
  storiesService.getAllStories,
);

router.delete(
  "/:storyId",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [UserRole.USER, UserRole.ADMIN] }),
  validation(storiesValidation.deleteStorySchema),
  storiesService.deleteStory,
);

export default router;
