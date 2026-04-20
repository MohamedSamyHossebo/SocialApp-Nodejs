import { z, ZodError } from 'zod';
import { NextFunction, Request, Response } from "express";
import { BadRequestException, InternalServerErrorException } from '../Error/ErrorHandler.middleware';

type KeyRequest=keyof Request;
type SchemaType=Partial<Record<KeyRequest,z.ZodType>>;

export const validation=(schema:SchemaType)=>{
    return (req:Request,res:Response,next:NextFunction):NextFunction=>{
        try {
            const validationError:Array<{
               key:KeyRequest;
               issues: Array<{
                message:string;
                path:(string|number|symbol)[],
                code:string
               }>
            }>=[];
            for(const key of Object.keys(schema)as KeyRequest[]){
                if(!schema[key])continue;
                const validationResults=schema[key].safeParse(req[key]);
                if(!validationResults.success){
                    const errors=validationResults.error as ZodError
                    validationError.push({
                      key,
                      issues:errors.issues.map((issue)=>{
                        return {
                            message:issue.message,
                            path:issue.path,
                            code:issue.code
                        }
                      })
                    });
                }
             
                }
            if(validationError.length>0){
                return next(new BadRequestException("Validation Error",{
                    cause:validationError
                })) as unknown as NextFunction
            }
           return next() as unknown as NextFunction;
        } catch (error) {
            return next(new InternalServerErrorException("Internal Server Error",{
                cause:error
            })) as unknown as NextFunction
        }
        
    }
}
export const generalFields = {
        firstName:z
        .string({error:"firstName is required"})
        .min(3,{message:"firstName must be at least 3 characters long"})
        .max(20,{message:"firstName must be at most 20 characters long"}),
        lastName:z
        .string({error:"lastName is required"})
        .min(3,{message:"lastName must be at least 3 characters long"})
        .max(20,{message:"lastName must be at most 20 characters long"}),
        gender:z.enum(["MALE","FEMALE"],{
            error:"gender must be MALE or FEMALE"
        }),
        birthDate:z.string(),
        phoneNumber:z.string(),
        email:z.email({error:"email is required"}),
        password:z.string({error:"password is required"}),
        confirmPassword:z.string({error:"confirmPassword is required"}),

}