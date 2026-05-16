import mongoose, { HydratedDocument, model, Schema } from "mongoose";
import {
  PROVIDER,
  UserGender,
  UserRole,
} from "../../../utils/enums/User.enums";

export interface IUser {
  firstName: string;
  lastName: string;
  userName?: string;
  email: string;
  confirmEmailOTP?: string;
  confirmEmail?: Date;

  password: string;
  resetPasswordOTP?: string;

  phoneNumber?: string | undefined;
  address?: string;

  gender: UserGender;
  role: UserRole;

  createdAt: Date;
  updatedAt?: Date;
  changeCredentialsTime?: Date;
  profilePic?: string;
  provider: number;
  deletedAt?: Date;
}

export const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 25,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 25,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    confirmEmailOTP: String,
    confirmEmail: String,
    changeCredentialsTime: Date,
    profilePic: String,
    password: {
      type: String,
      required: function (): boolean {
        return this.provider === PROVIDER.SYSTEM ? true : false;
      },
    },
    resetPasswordOTP: String,
    phoneNumber: String,
    address: String,
    deletedAt: Date,
    gender: {
      type: String,
      enum: Object.values(UserGender),
      default: UserGender.MALE,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    provider: {
      type: Number,
      enum: Object.values(PROVIDER).filter((v) => typeof v === "number"),
      default: PROVIDER.SYSTEM,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
UserSchema.virtual("userName")
  .set(function (value: string) {
    const [firstName, lastName] = value.split(" ") || [];
    this.set({ firstName, lastName });
  })
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  });
UserSchema.pre(["updateOne", "findOneAndUpdate"], async function () {
  const updateData: any = this.getUpdate();
  const isBeingFrozen =
    updateData.deletedAt || (updateData.$set && updateData.$set.deletedAt);
  if (isBeingFrozen) {
    const userId = this.getQuery()._id;
    if (userId) {
      await mongoose.model("Posts").deleteMany({ createdBy: userId });
      await mongoose.model("Comment").deleteMany({ createdBy: userId });
      await mongoose.model("Story").deleteMany({ createdBy: userId });
    }
  }
});
export const UserModel = model<IUser>("User", UserSchema);
export type HUserDocument = HydratedDocument<IUser>;
