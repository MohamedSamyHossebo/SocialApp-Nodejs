import { z } from "zod";
import { Types } from "mongoose";

const objectIdValidation = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "Invalid ObjectId format",
});

export const createStorySchema = {
  body: z.object({
    content: z.string().optional(),
    attachments: z.array(z.string()).optional(),
  }).refine(data => data.content || (data.attachments && data.attachments.length > 0), {
    message: "A story must have either content or attachments",
  }),
};

export const deleteStorySchema = {
  params: z.object({
    storyId: objectIdValidation,
  }),
};
