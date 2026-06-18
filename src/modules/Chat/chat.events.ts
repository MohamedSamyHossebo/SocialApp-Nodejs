import { IAuthSocket } from "../gateway/gateway.dto";
import { ChatService } from "./chat.service";

export class ChatEvents {
  private _chatService = new ChatService();
  constructor() {}
  sayHi = (socket: IAuthSocket) => {
    return socket.on("sayHi", (message, callback) => {
      this._chatService.sayHi({ message, socket, callback });
    });
  };

  joinRoom = (socket: IAuthSocket) => {
    return socket.on("joinRoom", (roomId) => {
      this._chatService.joinRoom({ roomId, socket });
    });
  };

  sendMessage = (socket: IAuthSocket) => {
    return socket.on("sendMessage", ({ roomId, message }, callback) => {
      this._chatService.sendMessage({ roomId, message, socket, callback });
    });
  };
}
