import jwt from "jsonwebtoken";
import { SignatureEnum, UserRole } from "../enums/User.enums";
import {
  ACCESS_EXPIRE,
  ADMIN_REFRESH_SIGNATURE,
  ADMIN_SIGNATURE,
  REFRESH_EXPIRE,
  USER_REFRESH_SIGNATURE,
  USER_SIGNATURE,
} from "../../config/config.service";
import { v4 as uuid } from "uuid";
export class TokenService {
  constructor() {}
  sign = async (
    payload: object,
    secretKey: string,
    options?: jwt.SignOptions,
  ): Promise<string> => {
    return jwt.sign(payload, secretKey, options);
  };
  verify = async (token: string, secretKey: string) => {
    return jwt.verify(token, secretKey);
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
}
