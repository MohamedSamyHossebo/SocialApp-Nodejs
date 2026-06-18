import { ISayHiDTO } from "./chat.dto";

export class ChatService {
  constructor() {}
  // APIS

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
