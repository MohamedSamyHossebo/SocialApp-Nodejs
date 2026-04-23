import { NextFunction, Request, Response } from "express";
import { IError } from "./Error.model";


export class AppError extends Error {
  constructor(
    message: string,
    options?: ErrorOptions,
    public statusCode: number = 400,
  ) {
    super(message, options);
    this.name = this.constructor.name;
  }
}
export class BadRequestException extends AppError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options, 400);
  }
}
export class UnAuthorizedException extends AppError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options, 401);
  }
}
export class ForbiddenException extends AppError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options, 403);
  }
}
export class NotFoundException extends AppError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options, 404);
  }
}
export class ConflictException extends AppError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options, 409);
  }
}
export class InternalServerErrorException extends AppError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options, 500);
  }
}

export const globalErrorHandler = (
  err: IError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  return res.status(err.statusCode || 500).json({
    message: err.message || "Something went wrong",
    stack: err.stack,
    cause:err.cause
  });
};
