import { Request, Response } from "express";
import { IGetChatDTO, ISayHiDTO } from "./chat.dto";
import { ChatRepository } from "../../DB/repositories/chat.repository";
import { ChatModel } from "../../DB/models/chat/chat.model";
import { UserModel } from "../../DB/models/user/User.model";
import { Types } from "mongoose";
import { UserRepository } from "../../DB/repositories/user.repository";
import { NotFoundException } from "../../middlewares/Error/ErrorHandler.middleware";

export class ChatService {
  private _chatModel = new ChatRepository(ChatModel);
  private _userModel = new UserRepository(UserModel);
  constructor() {}
  // APIS
  getAllChats = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.params as IGetChatDTO;
    const chat = await this._chatModel.findOne({
      filter: {
        participants: {
          $all: [
            req?.user?._id as Types.ObjectId,
            Types.ObjectId.createFromHexString(userId),
          ],
        },
        group: { $exists: false },
      },
      options: {
        populate: { path: "participants" },
      },
    });
    if (!chat) throw new NotFoundException("Chat Not Found Or Deleted");

    return res.success({
      message: "Found Chat",
      statusCode: 201,
      data: { chat },
    });
  };
  // IO

  sayHi = ({ message, socket, callback }: ISayHiDTO) => {
    try {
      console.log(message);
      callback ? callback("I recived Your Message") : undefined;
    } catch (error) {
      socket.emit("custom_error", error);
    }
  };
}

export default new ChatService();
