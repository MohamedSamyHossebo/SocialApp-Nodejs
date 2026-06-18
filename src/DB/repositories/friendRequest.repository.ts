import { Model } from "mongoose";
import { DataBaseRepository } from "../database.repository";
import { IFriendRequest } from "../models/friendRequest/friendRequest.model";
export class FriendRequstsRepository extends DataBaseRepository<IFriendRequest> {
  constructor(protected override readonly model: Model<IFriendRequest>) {
    super(model);
  }
}
