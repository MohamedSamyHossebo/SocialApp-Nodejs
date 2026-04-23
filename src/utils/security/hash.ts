import { hash,compare } from "bcrypt";
import { SALT } from "../../config/config.service";

export const generateHash= async (plainText:string,saltRounds:number=Number(SALT)):Promise<string>=>{
    return await hash(plainText,saltRounds);
}

export const compareHash = async (plainText:string,hash:string):Promise<boolean>=>{
    return await compare(plainText,hash)
}