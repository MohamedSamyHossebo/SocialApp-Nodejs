import { HUserDocument } from "../../DB/models/user/User.model";
import { CustomJWTPayload } from "../services/token";

declare module "express-serve-static-core" {
  interface Request {
    user: HUserDocument;
    decoded: CustomJWTPayload;
  }
}
