import { z } from "zod";
import { createPostSchema, reactToPostSchema, updatePostSchema } from "./posts.validation";

export type CreatePostDTO = z.infer<typeof createPostSchema.body>;
export type UpdatePostDTO = z.infer<typeof updatePostSchema.body> & z.infer<typeof updatePostSchema.params>;
export type ReactQueryParamToPostDTO = z.infer<typeof reactToPostSchema.query>;
export type ReactParamsToPostDTO = z.infer<typeof reactToPostSchema.params>;
