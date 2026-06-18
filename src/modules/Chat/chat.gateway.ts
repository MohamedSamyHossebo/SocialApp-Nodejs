import { IAuthSocket } from "../gateway/gateway.dto";
import { ChatEvents } from "./chat.events";

export class ChatGateWay {
  private _chatEvents = new ChatEvents();
  constructor() {}
  register = (socket: IAuthSocket) => {
    this._chatEvents.sayHi(socket);
  };
}
