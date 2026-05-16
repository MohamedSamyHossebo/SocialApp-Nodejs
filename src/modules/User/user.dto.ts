import { z } from "zod";
import { UpdateProfileSchema } from "./user.validation";

export type UpdateProfileDTO = z.infer<typeof UpdateProfileSchema.body>;
