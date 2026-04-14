import { Request, Response } from "express";

class AuthenticationService {
    constructor() { }
    signup = (req: Request, res: Response): Response => {
        return res.status(200).json({ message: "Signup successful" });
    }

}
export default new AuthenticationService();
