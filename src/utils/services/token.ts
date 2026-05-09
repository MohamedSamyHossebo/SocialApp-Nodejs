import jwt, { JwtPayload } from "jsonwebtoken";
import { SignatureEnum, TokenTypeEnum, UserRole } from "../enums/User.enums";
import {
  ACCESS_EXPIRE,
  ADMIN_REFRESH_SIGNATURE,
  ADMIN_SIGNATURE,
  REFRESH_EXPIRE,
  USER_REFRESH_SIGNATURE,
  USER_SIGNATURE,
} from "../../config/config.service";
import { v4 as uuid } from "uuid";
import {
  BadRequestException,
  NotFoundException,
} from "../../middlewares/Error/ErrorHandler.middleware";
import { UserRepository } from "../../DB/repositories/user.repository";
import { HUserDocument, UserModel } from "../../DB/models/user/User.model";

export interface CustomJWTPayload extends JwtPayload {
  id: string;
  jti: string;
}
export class TokenService {
  private _userRepo = new UserRepository(UserModel);
  constructor() {}
  sign = async (
    payload: object,
    secretKey: string,
    options?: jwt.SignOptions,
  ): Promise<string> => {
    return jwt.sign(payload, secretKey, options);
  };
  verify = async (
    token: string,
    secretKey: string,
  ): Promise<CustomJWTPayload> => {
    return jwt.verify(token, secretKey) as CustomJWTPayload;
  };
  getSignature = ({ signatureLevel = SignatureEnum.USER }) => {
    let signature: { accessSignature: string; refreshSignature: string } = {
      accessSignature: "",
      refreshSignature: "",
    };
    switch (signatureLevel) {
      case SignatureEnum.ADMIN:
        signature.accessSignature = ADMIN_SIGNATURE as string;
        signature.refreshSignature = ADMIN_REFRESH_SIGNATURE as string;
        break;
      case SignatureEnum.USER:
        signature.accessSignature = USER_SIGNATURE as string;
        signature.refreshSignature = USER_REFRESH_SIGNATURE as string;
        break;
      default:
        signature.accessSignature = USER_SIGNATURE as string;
        signature.refreshSignature = USER_REFRESH_SIGNATURE as string;
        break;
    }
    return signature;
  };

  getNewLoginCredentials = async (user: { _id: string; role: UserRole }) => {
    const signature = await this.getSignature({
      signatureLevel:
        user.role != UserRole.ADMIN ? SignatureEnum.USER : SignatureEnum.ADMIN,
    });
    const jwtId = uuid();
    const accessToken = await this.sign(
      { id: user._id, jti: jwtId },
      signature.accessSignature,
      { expiresIn: Number(ACCESS_EXPIRE) },
    );
    const refreshToken = await this.sign(
      { id: user._id, jti: jwtId },
      signature.refreshSignature,
      { expiresIn: Number(REFRESH_EXPIRE) },
    );
    return { accessToken, refreshToken };
  };
  
  decodedToken = async ({
    authorization,
    tokenType = TokenTypeEnum.ACCESS,
  }: {
    authorization: string;
    tokenType?: TokenTypeEnum;
  }): Promise<{ user: HUserDocument; decoded: CustomJWTPayload }> => {
    if (!authorization) {
      throw new BadRequestException("Authorization Header is missing");
    }
    const [Bearer, token] = authorization.split(" ") || [];
    if (!Bearer || !token) {
      throw new BadRequestException("Invalid Token Format");
    }
    let signature = await this.getSignature({
      signatureLevel:
        Bearer === "Admin" ? SignatureEnum.ADMIN : SignatureEnum.USER,
    });
    const secret =
      tokenType === TokenTypeEnum.ACCESS
        ? signature.accessSignature
        : signature.refreshSignature;
    const decoded = await this.verify(token, secret);
    const user = await this._userRepo.findById({ id: decoded.id });
    if (!user) {
      throw new NotFoundException("Not Registered Account");
    }
    return { user, decoded };
  };
}
