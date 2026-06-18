import { Request, Response } from "express";
import { IGetChatDTO, ISayHiDTO, ICreateGroupChatBodyDTO, IGetChatByIdDTO, IJoinRoomDTO, ISendMessageDTO } from "./chat.dto";
import { ChatRepository } from "../../DB/repositories/chat.repository";
import { ChatModel } from "../../DB/models/chat/Chat.model";
import { UserModel } from "../../DB/models/user/User.model";
import { Types } from "mongoose";
import { UserRepository } from "../../DB/repositories/user.repository";
import { NotFoundException } from "../../middlewares/Error/ErrorHandler.middleware";

export class ChatService {
  private _chatModel = new ChatRepository(ChatModel);
  private _userModel = new UserRepository(UserModel);
  constructor() {}
  // APIS
  getChat = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.params as IGetChatDTO;
    const userObjectId = req?.user?._id as Types.ObjectId;
    const targetUserId = Types.ObjectId.createFromHexString(userId);

    let chat = await this._chatModel.findOne({
      filter: {
        participants: {
          $all: [userObjectId, targetUserId],
        },
        group: { $exists: false },
      },
      options: {
        populate: { path: "participants" },
      },
    });

    if (!chat) {
      const createdChats = await this._chatModel.create({
        data: {
          participants: [userObjectId, targetUserId],
          createdBy: userObjectId,
          roomId: new Types.ObjectId().toHexString(), // Will update this after save to use chat _id
        }
      });
      chat = createdChats?.[0] || null;
      if (chat) {
        chat.roomId = chat._id.toHexString();
        await chat.save();
        await chat.populate("participants");
      }
    }

    return res.success({
      message: "Found/Created Chat",
      statusCode: 201,
      data: { chat },
    });
  };

  createGroupChat = async (req: Request, res: Response): Promise<Response> => {
    const { group, participants } = req.body as ICreateGroupChatBodyDTO;
    const userObjectId = req?.user?._id as Types.ObjectId;

    // lw el user mfesh chat p3ml create chat
    const participantsIds = participants.map((id) => Types.ObjectId.createFromHexString(id));
    if (!participantsIds.some((id) => id.equals(userObjectId))) {
      participantsIds.push(userObjectId);
    }

    const createdChats = await this._chatModel.create({
      data: {
        participants: participantsIds,
        createdBy: userObjectId,
        group,
        roomId: new Types.ObjectId().toHexString(),
      }
    });
    
    const chat = createdChats?.[0];
    if (chat) {
      chat.roomId = chat._id.toHexString();
      await chat.save();
      await chat.populate("participants");
    }

    return res.success({
      message: "Group Chat Created",
      statusCode: 201,
      data: { chat },
    });
  };

  getUserChats = async (req: Request, res: Response): Promise<Response> => {
    const userObjectId = req?.user?._id as Types.ObjectId;

    const chats = await this._chatModel.find({
      filter: {
        participants: { $in: [userObjectId] },
      },
      options: {
        populate: { path: "participants" },
      },
    });

    return res.success({
      message: "User Chats Retrieved",
      statusCode: 200,
      data: { chats },
    });
  };

  getChatById = async (req: Request, res: Response): Promise<Response> => {
    const { chatId } = req.params as IGetChatByIdDTO;
    const userObjectId = req?.user?._id as Types.ObjectId;

    const chat = await this._chatModel.findOne({
      filter: {
        _id: Types.ObjectId.createFromHexString(chatId),
        participants: { $in: [userObjectId] },
      },
      options: {
        populate: { path: "participants" },
      },
    });

    if (!chat) throw new NotFoundException("Chat Not Found Or Unauthorized");

    return res.success({
      message: "Chat Retrieved",
      statusCode: 200,
      data: { chat },
    });
  };
  // IO

  // sayHi = ({ message, socket, callback }: ISayHiDTO) => {
  //   try {
  //     console.log(message);
  //     callback ? callback("I recived Your Message") : undefined;
  //   } catch (error) {
  //     socket.emit("custom_error", error);
  //   }
  // };

  joinRoom = ({ roomId, socket }: IJoinRoomDTO) => {
    try {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    } catch (error) {
      socket.emit("custom_error", error);
    }
  };

  sendMessage = async ({ roomId, message, socket, callback }: ISendMessageDTO) => {
    try {
      const userObjectId = socket.credentials?.user?._id;
      if (!userObjectId) throw new Error("Unauthorized socket");

      const chat = await this._chatModel.findOne({
        filter: { roomId, participants: { $in: [userObjectId] } }
      });

      if (!chat) throw new Error("Chat not found or unauthorized");

      const newMessage = {
        content: message,
        createdBy: userObjectId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      chat.messages.push(newMessage as any);
      await chat.save();

      socket.to(roomId).emit("receiveMessage", {
        roomId,
        message: newMessage
      });

      callback ? callback({ success: true, message: "Message sent" }) : undefined;
    } catch (error) {
      socket.emit("custom_error", error);
    }
  };
}

export default new ChatService();
