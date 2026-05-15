import { z } from "zod";
import { createPostSchema } from "./posts.validation";

export type CreatePostDTO = z.infer<typeof createPostSchema.body>;
