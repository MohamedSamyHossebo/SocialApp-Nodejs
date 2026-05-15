import { mime, z, ZodError } from "zod";
import e, { NextFunction, Request, Response } from "express";
import {
  BadRequestException,
  InternalServerErrorException,
} from "../Error/ErrorHandler.middleware";
import { Types } from "mongoose";

type KeyRequest = keyof Request;
type SchemaType = Partial<Record<KeyRequest, z.ZodType>>;

export const validation = (schema: SchemaType) => {
  return (req: Request, res: Response, next: NextFunction): NextFunction => {
    try {
      const validationError: Array<{
        key: KeyRequest;
        issues: Array<{
          message: string;
          path: (string | number | symbol)[];
          code: string;
        }>;
      }> = [];
      for (const key of Object.keys(schema) as KeyRequest[]) {
        if (!schema[key]) continue;
        const validationResults = schema[key].safeParse(req[key]);
        if (!validationResults.success) {
          const errors = validationResults.error as ZodError;
          validationError.push({
            key,
            issues: errors.issues.map((issue) => {
              return {
                message: issue.message,
                path: issue.path,
                code: issue.code,
              };
            }),
          });
        }
      }
      if (validationError.length > 0) {
        return next(
          new BadRequestException("Validation Error", {
            cause: validationError,
          }),
        ) as unknown as NextFunction;
      }
      return next() as unknown as NextFunction;
    } catch (error) {
      return next(
        new InternalServerErrorException("Internal Server Error", {
          cause: error,
        }),
      ) as unknown as NextFunction;
    }
  };
};
export const generalFields = {
  firstName: z
    .string({ error: "firstName is required" })
    .min(3, { message: "firstName must be at least 3 characters long" })
    .max(20, { message: "firstName must be at most 20 characters long" }),
  lastName: z
    .string({ error: "lastName is required" })
    .min(3, { message: "lastName must be at least 3 characters long" })
    .max(20, { message: "lastName must be at most 20 characters long" }),
  gender: z.enum(["MALE", "FEMALE"], {
    error: "gender must be MALE or FEMALE",
  }),
  userName: z
    .string({ error: "userName is required" })
    .min(3, { message: "userName must be at least 3 characters long" })
    .max(20, { message: "userName must be at most 20 characters long" }),
  birthDate: z.string(),
  phoneNumber: z.string(),
  email: z.email({ error: "email is required" }),
  password: z.string({ error: "password is required" }),
  confirmPassword: z.string({ error: "confirmPassword is required" }),
  otp: z.string({ error: "OTP is required" }).regex(/^\d{6}$/),
  file: function (mimeTypes: string[]) {
    return z.strictObject({
      filedName: z.string(),
      originalName: z.string(),
      encoding: z.string(),
      mimeType: z.enum(mimeTypes, {
        error: `file must be one of the following types: ${mimeTypes.join(", ")}`,
      }),
      buffer: z.any().optional(),
      path: z.string().optional(),
      size: z.number().optional(),
    });
  },
  id: z.string().refine(
    (val) => {
      return Types.ObjectId.isValid(val);
    },
    { error: "Invalid ObjectId" },
  ),
};
