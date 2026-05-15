import { model, Schema, Types } from "mongoose";
import { IUser } from "../user/User.model";
import { ReactionsEnum } from "../../../utils/enums/Post.enums";

export interface IComment {
  content: string;
  attachements?: string[];
  postId: Types.ObjectId;
  commentId?: Types.ObjectId;
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
    postId: { type: Schema.Types.ObjectId, ref: "Posts", required: true },
    commentId: { type: Schema.Types.ObjectId, ref: "Comment" },
    tags: [{ type: Schema.Types.ObjectId, ref: "User" }],
    reactions: [
      {
        user: { type: Types.ObjectId, ref: "User", required: true },
        type: { type: Number, enum: ReactionsEnum, required: true },
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deletedAt: { type: Date },
    restoredAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

CommentSchema.virtual("replies", {
  ref: "Comment",
  localField: "_id",
  foreignField: "commentId",
});

export const CommentModel = model<IComment>("Comment", CommentSchema);
