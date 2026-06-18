import z from "zod";
import { generalFields } from "../../middlewares/Auth/validation.middleware";

export const getChatSchema = {
  params: z.strictObject({
    userId: generalFields.id,
  }),
};
