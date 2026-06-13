import { IUser } from "../../../DB/models/user/User.model";
import { PostRepository } from "../../../DB/repositories/post.repository";
import { PostsModel } from "../../../DB/models/post/Posts.model";
import { getAvailability } from "../posts.service";

const postRepo = new PostRepository(PostsModel);

export class PostResolver {
  getAllPosts = async (_: any, __: any, { user }: { user: IUser }) => {
    const posts = await postRepo.find({
      filter: { $or: getAvailability(user as any) },
      options: {
        populate: [
          { path: "createdBy", select: "firstName lastName email" },
          { path: "tags", select: "firstName lastName email" },
        ],
      },
    });
    return {
      message: "Posts retrieved successfully",
      posts,
    };
  };
}

export const postResolver = new PostResolver();
