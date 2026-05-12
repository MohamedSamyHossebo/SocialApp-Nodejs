import { Request, Response } from "express";
import { ConfirmEmailDTO, LogOutDTO, SignInDTO, SignUpDTO } from "./auth.dto";
import { UserModel } from "../../DB/models/user/User.model";
import { UserRepository } from "../../DB/repositories/user.repository";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../middlewares/Error/ErrorHandler.middleware";
import { compareHash, generateHash } from "../../utils/security/hash";
import { encrypt } from "../../utils/security/encryption";
import { generateOtp } from "../../utils/security/otp.security";
import { emailEmitter } from "../../utils/events/email.events";
import { TokenService } from "../../utils/services/token";
import { LogoutTypeEnum, PROVIDER } from "../../utils/enums/User.enums";
import { addFCM, getFCM, revokeTokenKey, set } from "../../DB/redis.service";
import { ACCESS_EXPIRE, CLIENT_ID } from "../../config/config.service";
import { OAuth2Client } from "google-auth-library";
import { notification } from "../../utils/services/notification.service";

class AuthenticationService {
  private _userRepo = new UserRepository(UserModel);
  private _tokenService: TokenService;
  constructor() {
    this._tokenService = new TokenService();
  }

  signup = async (req: Request, res: Response): Promise<Response> => {
    const { firstName, lastName, email, password, phoneNumber }: SignUpDTO =
      req.body;
    const checkUser = await this._userRepo.findOne({
      filter: { email },
      select: "email",
    });

    if (checkUser) throw new ConflictException("User Already Exists");
    const otp = generateOtp();

    const user = await this._userRepo.create({
      data: [
        {
          firstName,
          lastName,
          email,
          password: await generateHash(password),
          phoneNumber: await encrypt(phoneNumber),
          confirmEmailOTP: await generateHash(otp),
        },
      ],
      options: { validateBeforeSave: true },
    });
    await emailEmitter.emit("confirmEmail", { email, otp });
    return res.success({
      statusCode: 201,
      message: "Signup successful",
      data: {
        user,
      },
    });
  };
  confirmEmail = async (req: Request, res: Response): Promise<Response> => {
    const { email, otp }: ConfirmEmailDTO = req.body;
    const user = await this._userRepo.findOne({
      filter: {
        email,
        confirmEmailOTP: { $exists: true },
        confirmEmail: { $exists: false },
      },
    });
    if (!user)
      throw new NotFoundException("User Not found or Already Confirmed");
    if (!compareHash(otp, user.confirmEmailOTP as string))
      throw new BadRequestException("Invalid OTP");
    await this._userRepo.updateOne({
      filter: { email },
      update: {
        confirmEmail: new Date(),
        $unset: {
          confirmEmailOTP: true,
        },
      },
    });
    return res.success({
      statusCode: 200,
      message: "Your Email Successfully Confirmed",
    });
  };
  login = async (req: Request, res: Response): Promise<Response> => {
    const { email, password, FCM }: SignInDTO = req.body;
    const user = await this._userRepo.findOne({
      filter: { email, confirmEmail: { $exists: true } },
    });
    if (!user) {
      throw new NotFoundException("User Not Found");
    }
    if (!(await compareHash(password, user.password))) {
      throw new BadRequestException("Invalid Email Or Password ");
    }
    // Firbase Notfication
    if (FCM) {
      await addFCM(user._id, FCM);
      const tokens = await getFCM(user._id);
      if (tokens.length) {
        await notification.sendNotfications({
          tokens,
          data: { title: "Login", body: `New Login at ${Date.now()}` },
        });
      }
    }
    const credentials = await this._tokenService.getNewLoginCredentials(
      user as any,
    );
    return res.success({
      statusCode: 200,
      message: "Logged in Successfully",
      data: { credentials },
    });
  };
  verifyGoogle = async ({ idToken }: { idToken: string }) => {
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken,
      audience: CLIENT_ID as string,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      throw new BadRequestException("Invalid Google Token");
    }
    return payload;
  };

  googleLogin = async (req: Request, res: Response) => {
    const { idToken } = req.body;
    const { email, given_name, family_name, email_verified, picture } =
      await this.verifyGoogle({ idToken });
    if (!email) {
      throw new BadRequestException("Google token did not contain an email");
    }
    // if (!email_verified) {
    //   throw badRequest({ message: "Email not verified" });
    // }
    const user = await this._userRepo.findOne({
      filter: { email, confirmEmail: { $exists: true } },
    });
    if (!user) {
      throw new NotFoundException("User Not Found");
    }
    if (user) {
      if (user.provider === PROVIDER.GOOGLE) {
        const credentials = await this._tokenService.getNewLoginCredentials(
          user as any,
        );
        return res.success({
          statusCode: 200,
          message: "User logged in successfully",
          data: { credentials },
        });
      }
      throw new BadRequestException(
        "Email already registered with a different provider",
      );
    }
    const newUser = await this._userRepo.create({
      data: [
        {
          email,
          firstName: given_name as string,
          lastName: family_name as string,
          profilePic: picture as string,
          provider: PROVIDER.GOOGLE,
          confirmEmail: new Date(),
        },
      ],
    });
    const credentials = await this._tokenService.getNewLoginCredentials(
      newUser as any,
    );
    return res.success({
      statusCode: 201,
      message: "User logged in successfully",
      data: credentials,
    });
  };
  googleSignUp = async (req: Request, res: Response) => {
    const { idToken } = req.body;
    const { email, given_name, family_name, picture } = await this.verifyGoogle(
      {
        idToken,
      },
    );
    if (!email) {
      throw new BadRequestException("Google token did not contain an email");
    }
    const user = await this._userRepo.findOne({
      filter: { email },
    });
    if (user) {
      throw new ConflictException("Email already registered");
    }
    const newUser = await this._userRepo.create({
      data: [
        {
          email,
          firstName: given_name as string,
          lastName: family_name as string,
          profilePic: picture as string,
          provider: PROVIDER.GOOGLE,
          confirmEmail: new Date(),
        },
      ],
    });
    const credentials = await this._tokenService.getNewLoginCredentials(
      newUser as any,
    );
    return res.success({
      statusCode: 201,
      message: "User signed up successfully",
      data: { credentials },
    });
  };
  logoutWithRedis = async (req: Request, res: Response): Promise<Response> => {
    const { flag }: LogOutDTO = req.body;
    let statue = 200;
    switch (flag) {
      case LogoutTypeEnum.LOG_OUT:
        await set({
          key: revokeTokenKey({ userId: req.decoded.id, jti: req.decoded.jti }),
          value: req.decoded.jti,
          ttl: Number(ACCESS_EXPIRE),
        });
        statue = 201;
        break;
      case LogoutTypeEnum.LOG_OUT_FROM_ALL:
        await this._userRepo.updateOne({
          filter: { _id: req.decoded.id },
          update: {
            changeCredentialsTime: Date.now(),
          },
        });
        statue = 200;
        break;
      default:
        break;
    }
    return res.success({
      statusCode: 200,
      message: "Logged Out Successfully",
    });
  };
}
export default new AuthenticationService();
