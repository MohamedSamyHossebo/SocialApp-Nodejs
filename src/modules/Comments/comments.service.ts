import { Request, Response } from "express";
import { CreateCommentDTO, ReplyCommentDTO } from "./comments.dto";
import { UserRepository } from "../../DB/repositories/user.repository";
import { CommentModel } from "../../DB/models/comment/Comment.model";
import { IPosts, PostsModel } from "../../DB/models/post/Posts.model";
import { UserModel } from "../../DB/models/user/User.model";
import { PostRepository } from "../../DB/repositories/post.repository";
import { NotificationService } from "../../utils/services/notification.service";
import { CommentRepository } from "../../DB/repositories/comment.repository";
import { getAvailability } from "../Posts/posts.service";
import { NotFoundException } from "../../middlewares/Error/ErrorHandler.middleware";
import { HydratedDocument, Types } from "mongoose";
import { getFCM } from "../../DB/redis.service";
import {
  AvailabilityOptions,
  ReactionOptions,
  ReactionsEnum,
} from "../../utils/enums/Post.enums";

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
      data: {
        comment,
        enums: {
          reactions: ReactionOptions,
        },
      },
    });
  };

  getCommentsByPostId = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { postId } = req.params as { postId: string };
    const comments = await this._commentRepo.find({
      filter: { postId, commentId: { $exists: false }, deletedAt: { $exists: false } },
      options: {
        populate: [
          { path: "createdBy", select: "firstName lastName email" },
          { path: "tags", select: "firstName lastName email" },
          {
            path: "replies",
            populate: [
              { path: "createdBy", select: "firstName lastName email" },
              { path: "tags", select: "firstName lastName email" },
            ],
          },
        ],
      },
    });
    return res.success({
      statusCode: 200,
      message: "Comments retrieved successfully",
      data: {
        comments,
        enums: {
          reactions: ReactionOptions,
        },
      },
    });
  };

  updateComment = async (req: Request, res: Response): Promise<Response> => {
    const { commentId } = req.params as { commentId: string };
    const { content, tags = [] }: CreateCommentDTO = req.body;

    const updatePayload: any = {};
    if (content !== undefined) updatePayload.content = content;
    if (tags && tags.length) {
      updatePayload.tags = tags.map((tag) => new Types.ObjectId(tag));
    }

    const updatedComment = await this._commentRepo.findOneAndUpdate({
      filter: { _id: commentId, createdBy: req.user._id },
      update: updatePayload,
      options: { new: true },
    });

    if (!updatedComment) {
      throw new NotFoundException("Comment not found");
    }

    return res.success({
      statusCode: 200,
      message: "Comment updated successfully",
      data: {
        comment: updatedComment,
        enums: {
          reactions: ReactionOptions,
        },
      },
    });
  };

  deleteComment = async (req: Request, res: Response): Promise<Response> => {
    const { commentId } = req.params as { commentId: string };

    const deletedComment = await this._commentRepo.findOneAndUpdate({
      filter: { _id: commentId, createdBy: req.user._id },
      update: { deletedAt: new Date() },
      options: { new: true },
    });

    if (!deletedComment) {
      throw new NotFoundException("Comment not found");
    }

    return res.success({
      statusCode: 200,
      message: "Comment deleted successfully",
      data: {
        comment: deletedComment,
      },
    });
  };
  restoreSoftDeleteComment = async (req: Request, res: Response): Promise<Response> => {
    const { commentId } = req.params as { commentId: string };

    const deletedComment = await this._commentRepo.findOneAndUpdate({
      filter: { _id: commentId, createdBy: req.user._id },
      update: { $unset:{deletedAt:1} },
      options: { new: true },
    });

    if (!deletedComment) {
      throw new NotFoundException("Comment not found");
    }

    return res.success({
      statusCode: 200,
      message: "Comment deleted successfully",
      data: {
        comment: deletedComment,
      },
    });
  };
  
  hardDeleteComment = async (req: Request, res: Response): Promise<Response> => {
    const { commentId } = req.params as { commentId: string };

    const deletedComment = await this._commentRepo.findOneAndDelete({
      filter: { _id: commentId, createdBy: req.user._id },
      options: { new: true },
    });

    if (!deletedComment) {
      throw new NotFoundException("Comment not found");
    }

    return res.success({
      statusCode: 200,
      message: "Comment deleted successfully",
      data: {
        comment: deletedComment,
      },
    });
  };

  reactToComment = async (req: Request, res: Response): Promise<Response> => {
    const { commentId } = req.params;
    const reactionValue = Number(req.query.react);
    const userId = req.user._id;

    const isRemove = reactionValue < 0 || !(reactionValue in ReactionsEnum);

    // Remove existing reaction
    const commentAfterPull = await this._commentRepo.findOneAndUpdate({
      filter: { _id: commentId },
      update: { $pull: { reactions: { user: userId } } },
      options: { new: true },
    });

    if (!commentAfterPull) throw new NotFoundException("Comment not found");

    let comment = commentAfterPull;

    // Add new reaction if not a removal
    if (!isRemove) {
      const commentAfterPush = await this._commentRepo.findOneAndUpdate({
        filter: { _id: commentId },
        update: { $push: { reactions: { user: userId, type: reactionValue } } },
        options: { new: true },
      });

      if (commentAfterPush) comment = commentAfterPush;
    }

    return res.success({
      statusCode: 200,
      message: "Reacted successfully",
      data: {
        comment,
        enums: {
          availability: AvailabilityOptions,
          reactions: ReactionOptions,
        },
      },
    });
  };
  replyComment = async (req: Request, res: Response): Promise<Response> => {
    const { commentId, postId } = req.params as {
      commentId: string;
      postId: string;
    };
    const { content, tags = [] }: ReplyCommentDTO = req.body;

    const comment = await this._commentRepo.findOne({
      filter: { _id: commentId, postId },
      options: {
        populate: [
          { path: "postId", match: { $or: getAvailability(req.user) } },
        ],
      },
    });
    if (!comment) {
      throw new NotFoundException("Comment not found");
    }
    const mentions: Types.ObjectId[] = [];
    const FCM_TOKENS: string[] = [];
    if (tags.length) {
      const mentionedUsers = await this._userRepo.find({
        filter: { _id: { $in: tags } },
      });
      if (mentionedUsers.length !== tags.length) {
        throw new NotFoundException("One or more mentioned users not found");
      }
      for (const tag of tags) {
        mentions.push(new Types.ObjectId(tag));
        const tagged = await getFCM(tag);
        tagged.map((token: string) => {
          if (token) FCM_TOKENS.push(token);
        });
      }
    }

    const replyData: any = {
      createdBy: req.user._id,
      content: content as string,
      postId: comment.postId,
      commentId: comment._id,
    };
    if (mentions.length) {
      replyData.tags = mentions;
    }

    const [reply] =
      (await this._commentRepo.create({
        data: [replyData],
      })) || [];

    if (reply && FCM_TOKENS.length) {
      await this._notificationService.sendNotfications({
        tokens: FCM_TOKENS,
        data: {
          title: "You were mentioned in a reply",
          body: JSON.stringify({
            message: `${req.user.firstName} ${req.user.lastName} mentioned you in a reply`,
            reply: reply._id.toString(),
          }),
        },
      });
    }

    return res.success({
      statusCode: 200,
      message: "Reply created successfully",
      data: reply,
    });
  };
}

export default new CommentsService();
