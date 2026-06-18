import z from "zod";
import { IAuthSocket } from "../gateway/gateway.dto";
import { getChatSchema, createGroupChatSchema, getChatByIdSchema } from "./chat.validation";

export interface ISayHiDTO {
  message: string;
  socket: IAuthSocket;
  callback: any;
}

export interface IJoinRoomDTO {
  roomId: string;
  socket: IAuthSocket;
}

export interface ISendMessageDTO {
  roomId: string;
  message: string;
  socket: IAuthSocket;
  callback?: any;
}

export type IGetChatDTO = z.infer<typeof getChatSchema.params>;
export type ICreateGroupChatBodyDTO = z.infer<typeof createGroupChatSchema.body>;
export type IGetChatByIdDTO = z.infer<typeof getChatByIdSchema.params>;
