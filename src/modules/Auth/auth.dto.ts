import z from "zod"
import { loginSchema, signUpSchema } from "./auth.validation"

export type SignUpDTO=z.infer<typeof signUpSchema.body>
export type SignInDTO=z.infer<typeof loginSchema.body>
