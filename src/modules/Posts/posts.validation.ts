import {
  AvailabiltiesEnum,
  ReactionsEnum,
} from "./../../utils/enums/Post.enums";
import z from "zod";
import { generalFields } from "../../middlewares/Auth/validation.middleware";
import { Types } from "mongoose";

export const createPostSchema = {
  body: z
    .strictObject({
      content: z.string().optional(),
      files: z
        .array(
          generalFields.file([
            "image/jpeg",
            "image/png",
            "video/mp4",
            "application/pdf",
          ]),
        )
        .optional(),
      tags: z.array(z.string()).optional(),
      availability: z.coerce.number().default(AvailabiltiesEnum.PUBLIC),
    })
    .superRefine((args, ctx) => {
      if (!args.content && !args.files) {
        ctx.addIssue({
          code: "custom",
          path: ["content", "files"],
          message: "Either content or files must be provided",
        });
      }
      if (args.tags?.length) {
        const uniqueTags = [...new Set(args.tags)];
        if (uniqueTags.length !== args.tags.length) {
          ctx.addIssue({
            code: "custom",
            path: ["tags"],
            message: "Tags must be unique",
          });
        }
      }
      for (const tag of args.tags || []) {
        if (!Types.ObjectId.isValid(tag)) {
          ctx.addIssue({
            code: "custom",
            path: ["tags"],
            message: `Invalid ObjectId in tags ${tag}`,
          });
        }
      }
    }),
};
export const reactToPostSchema = {
  params: z.strictObject({
    postId: generalFields.id,
  }),
  query: z.strictObject({
    react: z.coerce.number().default(ReactionsEnum.LIKE),
  }),
};
export const updatePostSchema = {
  params: z.strictObject({
    postId: generalFields.id,
  }),
  body: z
    .strictObject({
      content: z.string().optional(),
      availability: z.coerce.number().optional(),
      tags: z.array(z.string()).optional(),
    })
    .superRefine((args, ctx) => {
      if (!args.content && !args.availability && !args.tags) {
        ctx.addIssue({
          code: "custom",
          path: ["content", "availability", "tags"],
          message: "At least one field must be provided for update",
        });
      }
    }),
};
