import { Server as httpServer } from "node:http";
import { Server } from "socket.io";
import { TokenTypeEnum } from "../../utils/enums/User.enums";
import { TokenService } from "../../utils/services/token";
import { IAuthSocket } from "./gateway.dto";
import { ChatGateWay } from "../Chat/chat.gateway";

export const initialize = async (httpServer: httpServer) => {
  const tokenService = new TokenService();
  const connectedSockets = new Map<string, string[]>();
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  // socket middleware
  io.use(async (socket: IAuthSocket, next) => {
    try {
      const authorization =
        socket.handshake?.auth?.authorization ||
        socket.handshake?.headers?.authorization;

      const { user, decoded } = await tokenService.decodedToken({
        authorization: authorization as string,
        tokenType: TokenTypeEnum.ACCESS,
      });
      const userTabs = connectedSockets.get(user._id.toString()) || [];
      userTabs.push(socket.id);
      connectedSockets.set(user._id.toString(), userTabs);
      socket.credentials = { user, decoded };

      next();
    } catch (error) {
      next(new Error("Invlid Token Or Expired"));
    }
  });
  // socket connection
  function disconnection(socket: IAuthSocket) {
    const userSocket = socket?.credentials?.user?._id?.toString() as string;
    console.log("Connected Sockets after connect", connectedSockets);
    socket.on("disconnect", () => {
      const userId = socket?.credentials?.user._id?.toString() as string;
      let remainingTabs =
        connectedSockets.get(userId)?.filter((tab) => {
          return tab !== socket.id;
        }) || [];
      if (remainingTabs.length) {
        connectedSockets.set(userId, remainingTabs);
      } else {
        connectedSockets.delete(userId);
      }
      console.log(`User disconnected: ${userSocket}`);
      console.log("After Delete Connected Sockets", connectedSockets);
    });
  }
  const chatGateway: ChatGateWay = new ChatGateWay();
  io.on("connection", (socket: IAuthSocket) => {
    chatGateway.register(socket);
    disconnection(socket);
  });
};
