import { z } from "zod";
import { createCommentSchema } from "./comments.validation";

export type CreateCommentDTO = z.infer<typeof createCommentSchema.body> &
  z.infer<typeof createCommentSchema.params>;
