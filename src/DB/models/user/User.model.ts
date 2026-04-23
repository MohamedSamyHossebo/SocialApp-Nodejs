import mongoose, {HydratedDocument, model, Schema} from "mongoose";
import { UserGender, UserRole } from "../../../utils/enums/User.enums";

export interface IUser {
  firstName:string;
  lastName:string;
  userName?:string;
  email:string;
  confirmEmailOTP?:string;
  confirmEmail?:Date;

  password:string;
  resetPasswordOTP?:string;

  phoneNumber?:string | undefined;
  address?:string;

  gender:UserGender;
  role:UserRole;

  createdAt:Date;
  updatedAt?:Date;
}


export const UserSchema = new Schema <IUser>(
  {
    firstName:{
      type:String,
      required:true,
      trim:true,
      minLength:2,
      maxLength:25,
    },
        lastName:{
      type:String,
      required:true,
      trim:true,
      minLength:2,
      maxLength:25,
    },
    email:{
      type:String,
      required:true,
      trim:true,
      unique:true
    },
    confirmEmailOTP:String,
    confirmEmail:String,
    password:{
      type:String,
      required:true,
    },
    resetPasswordOTP:String,
    phoneNumber:String,
    address:String,
    gender:{
      type:String,
      enum:Object.values(UserGender),
      default:UserGender.MALE
    },
    role:{
      type:String,
      enum:Object.values(UserRole),
      default:UserRole.USER
    },
  },
  { timestamps: true,toJSON:{virtuals:true},toObject:{virtuals:true} },
);
UserSchema.virtual("userName").set(
  function(value:string){
  const [firstName,lastName] =value.split(" ") || [];
  this.set({firstName,lastName})
  }
).get(
  function(){
    return `${this.firstName} ${this.lastName}`
  }
)

export const UserModel=model<IUser>("User",UserSchema);
export type HUserDocument=HydratedDocument<IUser>;
