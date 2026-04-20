import { Request, Response } from "express";
import { SignUpDTO } from "./auth.dto";

class AuthenticationService {
    constructor() { }
    signup = (req: Request, res: Response): Response => {
        const { firstName, lastName, email, password, }: SignUpDTO = req.body;
        console.log(firstName, lastName, email, password);
        return res.success({
            statusCode: 201,
            message: "Signup successful",
            data: {
                firstName,
                lastName,
                email,
            },
        });
    }

}
export default new AuthenticationService();
