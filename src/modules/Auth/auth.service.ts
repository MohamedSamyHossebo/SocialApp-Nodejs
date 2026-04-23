import { Request, Response } from "express";
import { SignUpDTO } from "./auth.dto";
import { UserModel } from "../../DB/models/user/User.model";
import { UserRepository } from "../../DB/repositories/user.repository";
import { ConflictException } from "../../middlewares/Error/ErrorHandler.middleware";

class AuthenticationService {
    private _userModel = new UserRepository(UserModel);
    constructor() { }
    signup = async (req: Request, res: Response): Promise<Response> => {
        const { firstName,lastName, email, password }: SignUpDTO = req.body;
        const checkUser= await this._userModel.findOne({filter:{email},select:"email"});

        if(checkUser) throw new ConflictException("User Already Exists");

        const user = await this._userModel.create({
            data:[{firstName,lastName, email, password}],
            options:{validateBeforeSave:true}
        })


        return res.success({
            statusCode: 201,
            message: "Signup successful",
            data: {
               user
            },
        });
    }

}
export default new AuthenticationService();
