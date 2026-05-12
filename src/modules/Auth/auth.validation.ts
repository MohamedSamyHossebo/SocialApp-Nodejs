import { email, z } from "zod";
import { generalFields } from "../../middlewares/Auth/validation.middleware";
import { LogoutTypeEnum } from "../../utils/enums/User.enums";

export const loginSchema = {
  body: z.strictObject({
    email: generalFields.email,
    password: generalFields.password,
    FCM: z.string().optional(),
  }),
};
export const signUpSchema = {
  body: loginSchema.body
    .extend({
      firstName: generalFields.firstName,
      lastName: generalFields.lastName,
      email: generalFields.email,
      phoneNumber: generalFields.phoneNumber,
      password: generalFields.password,
      confirmPassword: generalFields.confirmPassword,
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: "passwords do not match",
        });
      }
      //     // if(data.userName.split(" ").length!==2){
      //     //     ctx.addIssue({
      //     //         code:"custom",
      //     //         path:["userName"],
      //     //         message:"userName must be two words"
      //     //     })
      //     // }
    }),
};
export const confirmEmailSchema = {
  body: z.strictObject({
    email: generalFields.email,
    otp: generalFields.otp,
  }),
};
export const logoutSchema = {
  body: z.strictObject({
    flag: z.enum(LogoutTypeEnum),
  }),
};
