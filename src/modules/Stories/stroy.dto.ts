import { z } from "zod";
import { createStorySchema, deleteStorySchema } from "./stories.validation";

export type CreateStoryDto = z.infer<typeof createStorySchema.body>;
export type DeleteStoryDto = z.infer<typeof deleteStorySchema.params>;
