import { model, Schema, Types } from "mongoose";
import { IUser } from "../user/User.model";
import {
  AvailabiltiesEnum,
  ReactionsEnum,
} from "../../../utils/enums/Post.enums";

export interface IPosts {
  folderId?: string;
  content: string;
  attachments?: string[];
  comment?: Types.ObjectId[];
  reactions?: { user: Types.ObjectId | IUser; type: ReactionsEnum }[];
  tags?: Types.ObjectId[] | IUser[];
  availability?: AvailabiltiesEnum;
  createdBy: Types.ObjectId | IUser;
  updatedBy?: Types.ObjectId | IUser;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  restoredAt?: Date;
  AvailabaleReactions?: ReactionsEnum[];
}
const PostsShema = new Schema<IPosts>(
  {
    folderId: String,
    content: {
      type: String,
      required: function (this) {
        return !this.attachments || this.attachments.length === 0;
      },
    },
    attachments: [String],
    availability: {
      type: Number,
      enum: AvailabiltiesEnum,
      default: AvailabiltiesEnum.PUBLIC,
    },
    reactions: [
      {
        user: { type: Types.ObjectId, ref: "User", required: true },
        type: { type: Number, enum: ReactionsEnum, required: true },
      },
    ],
    comment: [{ type: Types.ObjectId, ref: "Comment" }],
    tags: [{ type: Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deletedAt: Date,
    restoredAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export const PostsModel = model<IPosts>("Posts", PostsShema);
