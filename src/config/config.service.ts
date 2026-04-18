import { resolve } from "path";
import dotenv from "dotenv";

const envPath = {
    dev: "../../.env.dev",
    prod: "../../.env.prod"
};

dotenv.config({ path: resolve(`.${envPath.dev}`) });

export const PORT = Number(process.env.PORT ?? 3000);
if (!process.env.MONGO_URI) {
    throw new Error("Missing required environment variable: MONGO_URI");
}
export const MONGO_URI = process.env.MONGO_URI as string;

export const WhiteList = process.env.WHITE_LIST as string;
