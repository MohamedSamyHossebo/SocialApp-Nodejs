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
import * as validators from "./user.validation";
const router: Router = Router();

router.get(
  "/profile",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  // userService.getProfile,
  async (req: Request, res: Response) => {
    const user = req.user;
    const data = await userService.getProfile(user);
    return res.success({
      statusCode: 200,
      data: data,
      message: "Done",
    });
  },
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
router.post(
  "/:userId/friend-request",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  validation(validators.sendFriendRequestSchema),
  userService.createFriendRequest,
);
router.patch(
  "/friend-request/:requestId/accept",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  validation(validators.acceptFriendRequestSchema),
  userService.acceptFrinedRqust,
);
router.delete(
  "/friend-request/:requestId/reject",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  validation(validators.rejectFriendRequestSchema),
  userService.rejectFriendRequest,
);

export default router;
