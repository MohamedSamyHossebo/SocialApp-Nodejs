import { Request, Response } from "express";
import {
  CreatePostDTO,
  ReactParamsToPostDTO,
  ReactQueryParamToPostDTO,
} from "./posts.dto";
import { UserRepository } from "../../DB/repositories/user.repository";
import { HUserDocument, UserModel } from "../../DB/models/user/User.model";
import { PostRepository } from "../../DB/repositories/post.repository";
import { PostsModel } from "../../DB/models/post/Posts.model";
import { NotificationService } from "../../utils/services/notification.service";
import { NotFoundException } from "../../middlewares/Error/ErrorHandler.middleware";
import { Types } from "mongoose";
import { getFCM } from "../../DB/redis.service";
import { success } from "zod";
import { AvailabiltiesEnum } from "../../utils/enums/Post.enums";

export const getAvailability = (user: HUserDocument) => {
  return [
    {
      availability: AvailabiltiesEnum.PUBLIC,
    },
    {
      availability: AvailabiltiesEnum.ONLY_ME,
      createdBy: user._id,
    },
    {
      tags: { $in: [user._id] },
    },
  ];
};
class PostsService {
  private readonly _userRepo = new UserRepository(UserModel);
  private readonly _postRepo = new PostRepository(PostsModel);
  private readonly _notificationService: NotificationService;

  constructor() {
    this._notificationService = new NotificationService();
  }
  createPost = async (req: Request, res: Response): Promise<Response> => {
    const { content, availability, tags = [] }: CreatePostDTO = req.body;

    if (!content) {
      throw new Error("Content is required");
    }

    const taggedUsers = tags.length
      ? await this._userRepo.find({
          filter: {
            _id: { $in: tags },
          },
          select: "firstName LastName email",
        })
      : [];
    if (taggedUsers.length !== tags.length) {
      throw new NotFoundException("One or more tagged users not found");
    }
    const tagged = taggedUsers.map((user) => user._id as Types.ObjectId);
    const tokensResults = await Promise.all(
      tags.map((tag: string) => getFCM(tag)),
    );
    const FCM_Tokens = [
      ...new Set(
        tokensResults.flat().filter((token): token is string => Boolean(token)),
      ),
    ];
    const posts =
      (await this._postRepo.create({
        data: [
          {
            content,
            availability,
            tags: tagged,
            createdBy: req.user._id,
          },
        ],
      })) || [];
    if (FCM_Tokens) {
      await this._notificationService.sendNotfications({
        tokens: FCM_Tokens,
        data: {
          title: "You were tagged in a post",
          body: JSON.stringify({
            message: `${req.user.firstName} ${req.user.lastName} tagged you in a post`,
            post: posts?.[0]?._id.toString(),
          }),
        },
      });
    }
    const populatedPosts = await posts?.[0]?.populate([
      { path: "createdBy", select: "firstName lastName email" },
      { path: "tags", select: "firstName lastName email" },
    ]);

    return res.success({
      statusCode: 200,
      data: populatedPosts,
      message: "Post created successfully",
    });
  };

  react = async (req: Request, res: Response): Promise<Response> => {
    const { postId } = req.params;
    const { react } = req.query;

    const post = await this._postRepo.findOneAndUpdate({
      filter: { _id: postId, $or: getAvailability(req.user) },
      update: {
        ...(Number(react) > 0
          ? { $addToSet: { likes: req.user._id } }
          : { $pull: { likes: req.user._id } }),
      },
    });
    if (!post) {
      throw new NotFoundException("Post not found");
    }
    return res.success({
      statusCode: 200,
      data: post,
      message: "Reacted to post successfully",
    });
  };
}

export default new PostsService();
