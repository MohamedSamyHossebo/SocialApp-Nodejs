import { HydratedDocument, model, Schema, Types } from "mongoose";

export interface IMessage {
  content: string;
  createdBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface IChat {
  // ovo
  participants: Types.ObjectId[];
  messages: IMessage[];
  // ovm
  group?: string;
  group_image?: string;
  roomId?: string;
  // common
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt?: Date;
}
export const MessageSchema = new Schema<IMessage>(
  {
    content: {
      type: String,
      required: true,
      maxLength: 500000,
      minLength: 1,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);
export const ChatSchema = new Schema<IChat>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    group: String,
    group_image: String,
    roomId: {
      type: String,
      required: function () {
        return this.roomId;
      },
    },
    messages: [MessageSchema],
  },
  {
    timestamps: true,
  },
);

export const ChatModel = model<IChat>("Chat", ChatSchema);
export type HChatDocument = HydratedDocument<IChat>;

export const MesasgeModel = model<IMessage>("Message", MessageSchema);
export type HMessageDocument = HydratedDocument<IMessage>;
