import { JwtPayload } from "jsonwebtoken";
import { Socket } from "socket.io";
import { HUserDocument } from "../../DB/models/user/User.model";

export interface IAuthSocket extends Socket {
  credentials?: {
    user: Partial<HUserDocument>;
    decoded: JwtPayload;
  };
}
