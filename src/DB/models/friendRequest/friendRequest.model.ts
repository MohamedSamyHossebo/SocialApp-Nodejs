import { HydratedDocument, model, Schema, Types } from "mongoose";
export interface IFriendRequest {
  createdBy: Types.ObjectId;
  sendTo: Types.ObjectId;
  acceptedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}
export const FriendRequstsSchema = new Schema<IFriendRequest>(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    sendTo: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    acceptedAt: Date,
  },
  {
    timestamps: true,
  },
);

export const FriendRquestModel = model<IFriendRequest>(
  "FriendRequsts",
  FriendRequstsSchema,
);
export type HFriendDocument = HydratedDocument<IFriendRequest>;
