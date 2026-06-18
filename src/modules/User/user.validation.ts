import { z } from "zod";
import { generalFields } from "../../middlewares/Auth/validation.middleware";

export const UpdateProfileSchema = {
  body: z
    .strictObject({
      firstName: generalFields.firstName.optional(),
      lastName: generalFields.lastName.optional(),
      email: generalFields.email.optional(),
      password: generalFields.password.optional(),
      gender: generalFields.gender.optional(),
      phoneNumber: generalFields.phoneNumber.optional(),
      birthDate: generalFields.birthDate.optional(),
    })
    .superRefine((data, ctx) => {
      if (
        !data.firstName &&
        !data.lastName &&
        !data.email &&
        !data.password &&
        !data.gender &&
        !data.phoneNumber &&
        !data.birthDate
      ) {
        ctx.addIssue({
          code: "custom",
          message: "You must provide at least one field",
          path: ["body"],
        });
      }
    }),
};
export const sendFriendRequestSchema = {
  params: z.strictObject({
    userId: generalFields.id,
  }),
};
export const acceptFriendRequestSchema = {
  params: z.strictObject({
    requestId: generalFields.id,
  }),
};
export const rejectFriendRequestSchema = {
  params: z.strictObject({
    requestId: generalFields.id,
  }),
};
