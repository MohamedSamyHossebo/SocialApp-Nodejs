import { model, Schema, Types } from "mongoose";
import { IUser } from "../user/User.model";
import { ReactionsEnum } from "../../../utils/enums/Post.enums";

export interface IComment {
  content: string;
  attachements?: string[];
  postId: Types.ObjectId;
  tags?: Types.ObjectId[];
  reactions?: { user: Types.ObjectId | IUser; type: number }[];
  AvailabaleReactions?: ReactionsEnum[];

  createdBy: Types.ObjectId | IUser;
  updatedBy?: Types.ObjectId | IUser;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  restoredAt?: Date;
}
const CommentSchema = new Schema<IComment>(
  {
    content: { type: String, required: true },
    attachements: [{ type: String }],
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    tags: [{ type: Schema.Types.ObjectId, ref: "User" }],
    reactions: [
      {
        user: { type: Types.ObjectId, ref: "User", required: true },
        type: { type: Number, enum: ReactionsEnum, required: true },
      },
    ],
    AvailabaleReactions: [{ type: Number, enum: ReactionsEnum }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export const CommentModel = model<IComment>("Comment", CommentSchema);
