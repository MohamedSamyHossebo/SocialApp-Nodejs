import z from "zod";
import { generalFields } from "../../middlewares/Auth/validation.middleware";

export const getChatSchema = {
  params: z.strictObject({
    userId: generalFields.id,
  }),
};

export const createGroupChatSchema = {
  body: z.strictObject({
    group: z.string().min(1).max(100),
    participants: z.array(generalFields.id).min(1),
  }),
};

export const getChatByIdSchema = {
  params: z.strictObject({
    chatId: generalFields.id,
  }),
};
