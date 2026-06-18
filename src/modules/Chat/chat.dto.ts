import { IAuthSocket } from "../gateway/gateway.dto";

export interface ISayHiDTO {
  message: string;
  socket: IAuthSocket;
  callback: any;
}
