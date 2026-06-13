import { Request, Response } from "express";
import { UserRepository } from "../../DB/repositories/user.repository";
import { UserModel } from "../../DB/models/user/User.model";
import { globalSuccessHandler } from "../../middlewares/Success/SucessHandler.middleware";
import {
  BadRequestException,
  NotFoundException,
} from "../../middlewares/Error/ErrorHandler.middleware";
import { generateHash } from "../../utils/security/hash";
import { UpdateProfileDTO } from "./user.dto";

class UserService {
  private _userRepo = new UserRepository(UserModel);
  constructor() {}
  getProfile = async (user: any) => {
    return {
      message: "User Profile Fetch Successfully",
      data: user,
    };
  };

  updateProfile = async (req: Request, res: Response): Promise<Response> => {
    const {
      firstName,
      lastName,
      email,
      password,
      gender,
      phoneNumber,
      birthDate,
    }: UpdateProfileDTO = req.body;

    if (email) {
      const emailExists = await this._userRepo.findOne({
        filter: {
          email: email,
          _id: { $ne: req.user._id },
        },
      });

      if (emailExists) {
        throw new BadRequestException("Email already taken by another account");
      }
    }

    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (gender) updateData.gender = gender;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (birthDate) updateData.birthDate = birthDate;

    if (password) {
      updateData.password = await generateHash(password);
    }

    const updatedUser = await this._userRepo.findOneAndUpdate({
      filter: { _id: req.user._id },
      update: updateData,
      options: {
        new: true,
        runValidators: true,
      },
    });

    if (!updatedUser) {
      throw new NotFoundException("User not found");
    }

    // Nshil el password mn el response 3shan myzharsh ll client (Security)
    updatedUser.password = undefined as any;
    updatedUser.confirmEmailOTP = undefined as any;
    return res.success({
      statusCode: 200,
      message: "Profile updated successfully",
      data: {
        user: updatedUser,
      },
    });
  };
  toggleFreezeAccount = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const user = await this._userRepo.findOne({
      filter: { _id: req.user._id },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    if (user.deletedAt) {
      await this._userRepo.updateOne({
        filter: { _id: req.user._id },
        update: { $unset: { deletedAt: 1 } },
      });
      return res.success({
        statusCode: 200,
        message: "Account Unfrozen successfully",
      });
    }
    await this._userRepo.updateOne({
      filter: { _id: req.user._id },
      update: { $set: { deletedAt: new Date() } },
    });
    return res.success({
      statusCode: 200,
      message: "Account frozen successfully",
    });
  };
}

export const userService = new UserService();
