import { Model } from "mongoose";
import { DataBaseRepository } from "../database.repository";
import { IComment } from "../models/comment/Comment.model";
export class CommentRepository extends DataBaseRepository<IComment> {
  constructor(protected override readonly model: Model<IComment>) {
    super(model);
  }
}
