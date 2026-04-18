import { CorsOptions } from "cors";
import { WhiteList } from "../../config/config.service";

const whiteList:string[]=[WhiteList]

export const corsOptions:CorsOptions={origin:(origin,callback)=>{
    if(!origin || whiteList.includes(origin)){
        callback(null,true)
    }else{
        callback(new Error("Not allowed by CORS"))
    }
},methods:["GET","POST","PUT","PATCH","DELETE"],

    }