import { Router } from "express";
import AuthenticationService from "./auth.service";
import { validation } from "../../middlewares/Auth/validation.middleware";
import * as AuthValidation from "./auth.validation";
import { authentication } from "../../middlewares/Auth/authentication.middleware";
import { TokenTypeEnum } from "../../utils/enums/User.enums";
const router: Router = Router();

router.post(
  "/signup",
  validation(AuthValidation.signUpSchema),
  AuthenticationService.signup,
);
router.post(
  "/login",
  validation(AuthValidation.loginSchema),
  AuthenticationService.login,
);
router.post("/google-login", AuthenticationService.googleLogin);
router.post("/google-signup", AuthenticationService.googleSignUp);
router.post(
  "/logout",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  validation(AuthValidation.logoutSchema),
  AuthenticationService.logoutWithRedis,
);
router.patch(
  "/confirm-email",
  validation(AuthValidation.confirmEmailSchema),
  AuthenticationService.confirmEmail,
);
export default router;
