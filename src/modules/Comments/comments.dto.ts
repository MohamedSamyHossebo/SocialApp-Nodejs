import { z } from "zod";
import { createCommentSchema, replyCommentSchema } from "./comments.validation";

export type CreateCommentDTO = z.infer<typeof createCommentSchema.body> &
  z.infer<typeof createCommentSchema.params>;
export type ReplyCommentDTO = z.infer<typeof replyCommentSchema.body> &
  z.infer<typeof replyCommentSchema.params>;
