import { Response, Request, NextFunction } from "express";
import { TokenTypeEnum } from "../../utils/enums/User.enums";
import { CustomJWTPayload, TokenService } from "../../utils/services/token";
import { BadRequestException } from "../Error/ErrorHandler.middleware";
import { HUserDocument } from "../../DB/models/user/User.model";


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
