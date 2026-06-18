import { Model } from "mongoose";
import { DataBaseRepository } from "../database.repository";
import { IChat } from "../models/chat/Chat.model";

export class ChatRepository extends DataBaseRepository<IChat> {
  constructor(protected override readonly model: Model<IChat>) {
    super(model);
  }
}
