import z from "zod";
import {
  confirmEmailSchema,
  loginSchema,
  signUpSchema,
} from "./auth.validation";

export type SignUpDTO = z.infer<typeof signUpSchema.body>;
export type SignInDTO = z.infer<typeof loginSchema.body>;
export type ConfirmEmailDTO = z.infer<typeof confirmEmailSchema.body>;
