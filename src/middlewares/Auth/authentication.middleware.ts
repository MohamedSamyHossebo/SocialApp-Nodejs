import { Response, Request, NextFunction } from "express";
import { TokenTypeEnum, UserRole } from "../../utils/enums/User.enums";
import { TokenService } from "../../utils/services/token";
import {
  BadRequestException,
  ForbiddenException,
} from "../Error/ErrorHandler.middleware";

export const authentication = ({ tokenType = TokenTypeEnum.ACCESS }) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const tokenService = new TokenService();
    if (!req.headers.authorization) {
      throw new BadRequestException("Authorization Header is Missing");
    }
    const { user, decoded } =
      (await tokenService.decodedToken({
        authorization: req.headers.authorization,
        tokenType,
      })) || {};
    req.user = user;
    req.decoded = decoded;
    return next();
  };
};

export const authorization = ({
  accessRoles = [],
}: {
  accessRoles?: UserRole[];
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user.role || !accessRoles.includes(req.user.role)) {
      throw new ForbiddenException("Forbidden Request");
    }
    return next();
  };
};
