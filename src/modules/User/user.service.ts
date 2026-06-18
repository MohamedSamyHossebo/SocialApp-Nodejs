import { Request, Response } from "express";
import { UserRepository } from "../../DB/repositories/user.repository";
import { UserModel } from "../../DB/models/user/User.model";
import { globalSuccessHandler } from "../../middlewares/Success/SucessHandler.middleware";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../middlewares/Error/ErrorHandler.middleware";
import { generateHash } from "../../utils/security/hash";
import { UpdateProfileDTO } from "./user.dto";
import { Types } from "mongoose";
import { FriendRequstsRepository } from "../../DB/repositories/friendRequest.repository";
import { FriendRquestModel } from "../../DB/models/friendRequest/friendRequest.model";

class UserService {
  private _userRepo = new UserRepository(UserModel);
  private _fRequestRepo = new FriendRequstsRepository(FriendRquestModel);
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
  createFriendRequest = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { userId } = req.params as unknown as { userId: Types.ObjectId };
    const checkFriendRequstExist = await this._fRequestRepo.findOne({
      filter: {
        createdBy: { $in: [req.user?._id, userId] },
        sendTo: { $in: [req.user?._id, userId] },
      },
    });
    if (checkFriendRequstExist)
      throw new ConflictException("Friend Request Already Exists");
    const checkUserExists = await this._userRepo.findOne({
      filter: {
        _id: userId,
      },
    });
    if (!checkUserExists) throw new NotFoundException("User Not Found");
    const [friend] =
      (await this._fRequestRepo.create({
        data: [
          {
            createdBy: req.user?._id as Types.ObjectId,
            sendTo: userId,
          },
        ],
      })) || [];
    if (!friend) throw new BadRequestException("Fail to send frined request");
    await this._userRepo.updateOne({
      filter: { _id: userId },
      update: { $push: { friendRequests: friend._id } },
    });
    return res.success({
      statusCode: 200,
      message: "Sent Friend Rquest Successfully",
      data: friend,
    });
  };
  acceptFrinedRqust = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { requestId } = req.params as unknown as { requestId: Types.ObjectId };

    const friendRequest = await this._fRequestRepo.findOneAndUpdate({
      filter: {
        _id: requestId,
        sendTo: req.user._id,
        acceptedAt: { $exists: false }
      },
      update: {
        $set: { acceptedAt: new Date() }
      },
      options: { new: true }
    });

    if (!friendRequest) {
      throw new NotFoundException("Friend request not found or already accepted");
    }

    await this._userRepo.updateOne({
      filter: { _id: req.user._id },
      update: { $pull: { friendRequests: requestId } }
    });

    return res.success({
      statusCode: 200,
      message: "Accepted Friend Request Successfully",
      data: friendRequest,
    });
  };
}

export const userService = new UserService();
