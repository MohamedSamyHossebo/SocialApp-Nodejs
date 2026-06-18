import z from "zod";
import { IAuthSocket } from "../gateway/gateway.dto";
import { getChatSchema } from "./chat.validation";

export interface ISayHiDTO {
  message: string;
  socket: IAuthSocket;
  callback: any;
}

export type IGetChatDTO = z.infer<typeof getChatSchema.params>;
