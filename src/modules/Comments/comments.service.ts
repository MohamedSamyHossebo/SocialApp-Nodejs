import { Request, Response } from "express";
import { CreateCommentDTO } from "./comments.dto";
import { UserRepository } from "../../DB/repositories/user.repository";
import { CommentModel } from "../../DB/models/comment/Comment.model";
import { PostsModel } from "../../DB/models/post/Posts.model";
import { UserModel } from "../../DB/models/user/User.model";
import { PostRepository } from "../../DB/repositories/post.repository";
import { NotificationService } from "../../utils/services/notification.service";
import { CommentRepository } from "../../DB/repositories/comment.repository";
import { getAvailability } from "../Posts/posts.service";
import { NotFoundException } from "../../middlewares/Error/ErrorHandler.middleware";
import { Types } from "mongoose";
import { getFCM } from "../../DB/redis.service";

class CommentsService {
  private readonly _postRepo = new PostRepository(PostsModel);
  private readonly _userRepo = new UserRepository(UserModel);
  private readonly _commentRepo = new CommentRepository(CommentModel);
  private readonly _notificationService: NotificationService;

  constructor() {
    this._notificationService = new NotificationService();
  }

  createComment = async (req: Request, res: Response): Promise<Response> => {
    const { postId } = req.params as { postId: string };
    const { tags = [], content }: CreateCommentDTO = req.body;

    const post = await this._postRepo.findOne({
      filter: {
        _id: postId,
        $or: getAvailability(req.user),
        deletedAt: { $exists: false },
      },
    });
    if (!post) {
      throw new NotFoundException("Post not found");
    }

    const tagged: Types.ObjectId[] = [];
    const FCM_TOKENS: string[] = [];
    
    if (tags.length) {
      const taggedAccounts = await this._userRepo.find({
        filter: { _id: { $in: tags } },
      });
      if (taggedAccounts.length !== tags.length) {
        throw new NotFoundException("One or more tagged users not found");
      }
      for (const tag of tags) {
        tagged.push(new Types.ObjectId(tag));
        (await getFCM(tag)).map((token) => {
          if (token) {
            FCM_TOKENS.push(token);
          }
        });
      }
    }

    const [comment] =
      (await this._commentRepo.create({
        data: [
          {
            createdBy: req.user._id,
            content: content as string,
            postId: post._id,
            ...(tagged.length > 0 && { tags: tagged }),
          },
        ],
      })) || [];

    if (comment) {
      await this._postRepo.updateOne({
        filter: { _id: post._id },
        update: { $push: { comment: comment._id } },
      });
    }

    if (FCM_TOKENS && comment) {
      await this._notificationService.sendNotfications({
        tokens: FCM_TOKENS,
        data: {
          title: "You were tagged in a comment",
          body: JSON.stringify({
            message: `${req.user.firstName} ${req.user.lastName} mentioned you in a comment`,
            comment: comment._id.toString(),
          }),
        },
      });
    }

    return res.success({
      statusCode: 200,
      message: "Comment created successfully",
      data: comment,
    });
  };

  getCommentsByPostId = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { postId } = req.params as { postId: string };
    const comments = await this._commentRepo.find({
      filter: { postId },
      options: {
        populate: [
          { path: "createdBy", select: "firstName lastName email" },
          { path: "tags", select: "firstName lastName email" },
        ],
      },
    });
    return res.success({
      statusCode: 200,
      message: "Comments retrieved successfully",
      data: comments,
    });
  };
  updateComment = async (req: Request, res: Response): Promise<Response> => {
    return res.success({
      statusCode: 200,
      message: "Comment created successfully",
    });
  };
  deleteComment = async (req: Request, res: Response): Promise<Response> => {
    return res.success({
      statusCode: 200,
      message: "Comment created successfully",
    });
  };
}

export default new CommentsService();
