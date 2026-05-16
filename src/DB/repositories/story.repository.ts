import { DataBaseRepository } from "../database.repository";
import { IStory } from "../models/story/Story.model";
import { Model } from "mongoose";

export class StoryRepository extends DataBaseRepository<IStory> {
  constructor(protected override readonly model: Model<IStory>) {
    super(model);
  }
}
