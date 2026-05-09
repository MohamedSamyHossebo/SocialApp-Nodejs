import { Request, Response } from "express";
import { UserRepository } from "../../DB/repositories/user.repository";
import { UserModel } from "../../DB/models/user/User.model";
import { globalSuccessHandler } from "../../middlewares/Success/SucessHandler.middleware";

class UserService {
  private _userRepo = new UserRepository(UserModel);
  constructor() {}
  getProfile = async (req: Request, res: Response) => {
    return res.success({
      statusCode: 200,
      message: "Logged in Successfully",
      data: req.user,
    });
  };
}

export const userService = new UserService();
