import { Types } from "mongoose";
import { IUser } from "../user/User.model";
import { ReactionsEnum } from "../../../utils/enums/Post.enums";

export interface IComment {
  comment: string;
  attachements?: string[];
  postId: string;
  AvailabaleReactions?: ReactionsEnum[];

  createdBy: Types.ObjectId | IUser;
  updatedBy?: Types.ObjectId | IUser;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  restoredAt?: Date;
}
