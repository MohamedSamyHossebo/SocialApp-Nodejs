import { z } from "zod";
import { generalFields } from "../../middlewares/Auth/validation.middleware";

export const createCommentSchema = {
  params: z.strictObject({
    postId: generalFields.id,
  }),
  body: z
    .strictObject({
      content: z.string().optional(),
      tags: z.array(generalFields.id).optional(),
    })
    .superRefine((data, ctx) => {
      if (!data.content && (!data.tags || data.tags.length === 0)) {
        ctx.addIssue({
          code: "custom",
          message: "Either content or tags must be provided",
        });
      }
    }),
};
