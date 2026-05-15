import { Model } from "mongoose";
import { DataBaseRepository } from "../database.repository";
import { IPosts } from "../models/post/Posts.model";

export class PostRepository extends DataBaseRepository<IPosts> {
  constructor(protected override readonly model: Model<IPosts>) {
    super(model);
  }
}
