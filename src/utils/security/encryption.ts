import crypto from "crypto"
import {ENC_KEY} from "../../config/config.service"

const IV_LENGTH=16;

const ENCRYPTION_SECRET_KEY:Buffer=Buffer.from(ENC_KEY,"utf-8");

if(ENCRYPTION_SECRET_KEY.length!==32){
    throw new Error("Encryption Key must be 32 bytes for aes-256-cbc")
}
export const encrypt = async (text:string):Promise<string>=>{
    const iv:Buffer=crypto.randomBytes(IV_LENGTH);
    const chipher = crypto.createCipheriv(
        "aes-256-cbc",
        ENCRYPTION_SECRET_KEY,
        iv
    )
    let encryptedData:string = chipher.update(text,"utf-8","hex");
    encryptedData += chipher.final("hex");

    return `${iv.toString("hex")}:${encryptedData}`
}
export const decrypt = async (encryptedData:string):Promise<string>=>{
    const [ivHex,encryptedText]=encryptedData.split(":");
    if (!ivHex|| ! encryptedText) throw new Error("Invalid encrypted data format")
    const iv:Buffer=Buffer.from(ivHex,"hex");
    const dechiper= crypto.createDecipheriv(
        "aes-256-cbc",
        ENCRYPTION_SECRET_KEY,
        iv
    )
    let decryptedData:string=dechiper.update(encryptedText,"hex","utf-8");
    decryptedData += dechiper.final("utf-8");
    return decryptedData
}