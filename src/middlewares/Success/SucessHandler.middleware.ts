import { NextFunction, Request, Response } from "express";
import { ISuccessResponse } from "./Success.model";


declare global {
  namespace Express {
    interface Response {
      success: (payload: ISuccessResponse) => any;
    }
  }
}


export const globalSuccessHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.success = ({ statusCode = 200, message, data }: ISuccessResponse) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data: data ?? {},
    });
  };
  next();
};
