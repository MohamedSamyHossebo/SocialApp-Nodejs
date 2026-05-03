import { Router } from "express";
import AuthenticationService from "./auth.service";
import { validation } from "../../middlewares/Auth/validation.middleware";
import * as AuthValidation from "./auth.validation";
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
router.patch(
  "/confirm-email",
  validation(AuthValidation.confirmEmailSchema),
  AuthenticationService.confirmEmail,
);
export default router;
