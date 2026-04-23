import { Request, Response } from "express";
import { ConfirmEmailDTO, SignUpDTO } from "./auth.dto";
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

class AuthenticationService {
  private _userModel = new UserRepository(UserModel);
  constructor() {}
  signup = async (req: Request, res: Response): Promise<Response> => {
    const { firstName, lastName, email, password, phoneNumber }: SignUpDTO =
      req.body;
    const checkUser = await this._userModel.findOne({
      filter: { email },
      select: "email",
    });

    if (checkUser) throw new ConflictException("User Already Exists");
    const otp = generateOtp();

    const user = await this._userModel.create({
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
    const user = await this._userModel.findOne({
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
    await this._userModel.updateOne({
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
}
export default new AuthenticationService();
