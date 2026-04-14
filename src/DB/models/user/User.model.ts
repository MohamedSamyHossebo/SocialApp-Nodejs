import mongoose from "mongoose";
import { UserGender, UserRole } from "./User.enums";
const UserSchema = new mongoose.Schema(
  {
    firstName: {
      required: [true, "First name is required"],
      minLength: [2, "First name must be at least 2 characters"],
      maxLength: [25, "First name must be less than 25 characters"],
      trim: true,
      type: String,
    },
    lastName: {
      required: [true, "Last name is required"],
      minLength: [2, "Last name must be at least 2 characters"],
      maxLength: [25, "Last name must be less than 25 characters"],
      trim: true,
      type: String,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [/\S+@\S+\.\S+/, "Please use a valid email address"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [6, "Password must be at least 6 characters"],
      maxLength: [25, "Password must be less than 25 characters"],
    },
    gender: {
      type: String,
      enum: [UserGender.MALE, UserGender.FEMALE],
      default: UserGender.MALE,
    },
    profileImage: String,
    coverImage: [String],
    role: {
      type: String,
      enum: [UserRole.USER, UserRole.ADMIN],
      default: UserRole.USER,
    },
    confirmEmailOtp: String,
    forgetPasswordOtp: String,
    isActive: Boolean,
    confirmEmail: Date,
    changeCredentialsAt: Date,
  },
  { timestamps: true },
);
const User = mongoose.model("User", UserSchema);
export default User;
