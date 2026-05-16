import { Request, Response } from "express";
import { StoryRepository } from "../../DB/repositories/story.repository";
import { StoryModel } from "../../DB/models/story/Story.model";
import {
  NotFoundException,
  BadRequestException,
} from "../../middlewares/Error/ErrorHandler.middleware";
import { CreateStoryDto } from "./stroy.dto";

class StoriesService {
  private _storyRepo = new StoryRepository(StoryModel);

  createStory = async (req: Request, res: Response): Promise<Response> => {
    const { content, attachments }: CreateStoryDto = req.body;

    const newStory = await this._storyRepo.create({
      data: {
        ...(content && { content }),
        ...(attachments && { attachments }),
        createdBy: req.user._id,
      },
    });

    return res.success({
      statusCode: 201,
      message: "Story created successfully",
      data: {
        story: newStory,
      },
    });
  };

  getAllStories = async (req: Request, res: Response): Promise<Response> => {
    // Optionally filter out expired stories just in case MongoDB's TTL job is delayed
    const activeStories = await this._storyRepo.find({
      filter: { expiresAt: { $gt: new Date() } },
      options: {
        populate: {
          path: "createdBy",
          select: "email userName",
        },
        sort: { createdAt: -1 },
      },
    });

    return res.success({
      statusCode: 200,
      message: "Stories fetched successfully",
      data: {
        stories: activeStories,
      },
    });
  };

  deleteStory = async (req: Request, res: Response): Promise<Response> => {
    const { storyId } = req.params;

    const deletedStory = await this._storyRepo.findOneAndDelete({
      filter: {
        _id: storyId,
        createdBy: req.user._id, // Ensure users can only delete their own stories
      },
    });

    if (!deletedStory) {
      throw new NotFoundException(
        "Story not found or you do not have permission to delete it",
      );
    }

    return res.success({
      statusCode: 200,
      message: "Story deleted successfully",
      data: {
        story: deletedStory,
      },
    });
  };
}

export const storiesService = new StoriesService();
