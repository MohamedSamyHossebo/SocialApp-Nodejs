import { IUser } from "../../../DB/models/user/User.model";
import { userService } from "../user.service";

export class UserResolver {
  constructor() {}
  getProfile = async (_: any, __: any, { user }: { user: IUser }) => {
    const result = await userService.getProfile(user);
    return {
      message: result.message,
      user: result.data,
    };
  };
}

export const userResolver = new UserResolver();
