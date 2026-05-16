import { update } from "./../../DB/redis.service";
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
import {
  AvailabiltiesEnum,
  ReactionOptions,
  ReactionsEnum,
  AvailabilityOptions,
} from "../../utils/enums/Post.enums";

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
      data: {
        post: populatedPosts,
        enums: {
          availability: AvailabilityOptions,
          reactions: ReactionOptions,
        },
      },
      message: "Post created successfully",
    });
  };

  updatePost = async (req: Request, res: Response): Promise<Response> => {
    const { postId } = req.params;
    const { content, availability, tags = [] } = req.body;

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

    const updatePost = await this._postRepo.findOneAndUpdate({
      filter: { _id: postId, createdBy: req.user._id },
      update: {
        content,
        availability,
        tags: tagged,
      },
      options: { new: true },
    });

    if (!updatePost) {
      throw new NotFoundException("Post not found");
    }

    if (FCM_Tokens.length) {
      await this._notificationService.sendNotfications({
        tokens: FCM_Tokens,
        data: {
          title: "You were tagged in a post",
          body: JSON.stringify({
            message: `${req.user.firstName} ${req.user.lastName} tagged you in a post`,
            post: updatePost._id.toString(),
          }),
        },
      });
    }

    const populatedUpdatePost = await updatePost.populate([
      { path: "createdBy", select: "firstName lastName email" },
      { path: "tags", select: "firstName lastName email" },
    ]);

    return res.success({
      statusCode: 200,
      data: {
        post: populatedUpdatePost,
        enums: {
          availability: AvailabilityOptions,
          reactions: ReactionOptions,
        },
      },
      message: "Post updated successfully",
    });
  };

  deletePost = async (req: Request, res: Response): Promise<Response> => {
    const { postId } = req.params;
    const deletedPost = await this._postRepo.findOneAndUpdate({
      filter: { _id: postId, createdBy: req.user._id },
      update: { deletedAt: new Date() },
      options: { new: true },
    });
    if (!deletedPost) {
      throw new NotFoundException("Post not found");
    }
    return res.success({
      statusCode: 200,
      message: "Post deleted successfully",
      data: {
        post: deletedPost,
      },
    });
  };
  
  hardDeletePost = async (req: Request, res: Response): Promise<Response> => {
    const { postId } = req.params;
    const deletedPost = await this._postRepo.findOneAndDelete({
      filter: {
        _id: postId,
        createdBy: req.user._id,
      },
      options: {
        new: true,
      },
    });
    if (!deletedPost) {
      throw new NotFoundException("Post not found");
    }
    return res.success({
      statusCode: 200,
      message: "Post deleted successfully",
      data: {
        post: deletedPost,
      },
    });
  };

  getAllPosts = async (req: Request, res: Response): Promise<Response> => {
    const user = req.user;
    const posts = await this._postRepo.find({
      filter: { $or: getAvailability(user) },
      options: {
        populate: [
          { path: "createdBy", select: "firstName lastName email" },
          { path: "comment" },
          { path: "tags", select: "firstName lastName email" },
        ],
      },
    });
    return res.success({
      statusCode: 200,
      data: {
        posts,
        enums: {
          availability: AvailabilityOptions,
          reactions: ReactionOptions,
        },
      },
      message: "Posts retrieved successfully",
    });
  };
  getMyPosts = async (req: Request, res: Response): Promise<Response> => {
    const user = req.user;
    const posts = await this._postRepo.find({
      filter: { createdBy: user._id },
      options: {
        populate: [
          { path: "tags", select: "firstName lastName email" },
          { path: "comment" },
        ],
      },
    });
    return res.success({
      statusCode: 200,
      data: {
        posts,
        enums: {
          availability: AvailabilityOptions,
          reactions: ReactionOptions,
        },
      },
      message: "My posts retrieved successfully",
    });
  };
  react = async (req: Request, res: Response): Promise<Response> => {
    const { postId } = req.params;
    const reactionValue = Number(req.query.react);
    const userId = req.user._id;

    const isRemove = reactionValue < 0 || !(reactionValue in ReactionsEnum);

    // Remove existing reaction
    const postAfterPull = await this._postRepo.findOneAndUpdate({
      filter: { _id: postId, $or: getAvailability(req.user) },
      update: { $pull: { reactions: { user: userId } } },
      options: { new: true },
    });

    if (!postAfterPull) throw new NotFoundException("Post not found");

    let post = postAfterPull;

    // Add new reaction if not a removal
    if (!isRemove) {
      const postAfterPush = await this._postRepo.findOneAndUpdate({
        filter: { _id: postId },
        update: { $push: { reactions: { user: userId, type: reactionValue } } },
        options: { new: true },
      });

      if (postAfterPush) post = postAfterPush;
    }

    return res.success({
      statusCode: 200,
      message: "Reacted successfully",
      data: {
        post,
        enums: {
          availability: AvailabilityOptions,
          reactions: ReactionOptions,
        },
      },
    });
  };
}

export default new PostsService();
