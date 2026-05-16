import { model, Schema, Types } from "mongoose";
import { IUser } from "../user/User.model";

export interface IStory {
  content?: string;
  attachments?: string[];
  createdBy: Types.ObjectId | IUser;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StorySchema = new Schema<IStory>(
  {
    content: {
      type: String,
      required: function (this: any) {
        return !this.attachments || this.attachments.length === 0;
      },
    },
    attachments: [String],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

StorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const StoryModel = model<IStory>("Story", StorySchema);
