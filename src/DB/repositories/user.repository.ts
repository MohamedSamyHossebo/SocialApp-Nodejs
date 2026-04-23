import { Model } from "mongoose";
import { DataBaseRepository } from "../database.repository";
import { IUser } from "../models/user/User.model";

export class UserRepository extends DataBaseRepository <IUser>{
    constructor(protected override readonly model:Model<IUser>
    ){
        super(model)
    }
}