import { resolve } from "path";
import dotenv from "dotenv";

const envPath = {
  dev: "../../.env.dev",
  prod: "../../.env.prod",
};

dotenv.config({ path: resolve(`.${envPath.dev}`) });

export const PORT = Number(process.env.PORT ?? 3000);
if (!process.env.MONGO_URI) {
  throw new Error("Missing required environment variable: MONGO_URI");
}
export const MONGO_URI = process.env.MONGO_URI as string;

export const WhiteList = process.env.WHITE_LIST as string;

export const SALT = process.env.SALT as string;
export const ENC_KEY = process.env.ENC_KEY as string;

export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
// JWT
export const ADMIN_SIGNATURE = process.env.JWT_ADMIN_SECRET;
export const ADMIN_REFRESH_SIGNATURE = process.env.JWT_REFRESH_ADMIN_SECRET;

export const USER_SIGNATURE = process.env.JWT_USER_SECRET;
export const USER_REFRESH_SIGNATURE = process.env.JWT_REFRESH_USER_SECRET;
// JWT EXP
export const ACCESS_EXPIRE = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN;
export const REFRESH_EXPIRE = process.env.JWT_REFRESH_TOKEN_EXPIRES_IN;
