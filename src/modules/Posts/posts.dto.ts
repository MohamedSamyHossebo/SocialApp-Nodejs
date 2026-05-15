import { z } from "zod";
import { createPostSchema, reactToPostSchema } from "./posts.validation";

export type CreatePostDTO = z.infer<typeof createPostSchema.body>;
export type ReactQueryParamToPostDTO = z.infer<typeof reactToPostSchema.query>;
export type ReactParamsToPostDTO = z.infer<typeof reactToPostSchema.params>;
