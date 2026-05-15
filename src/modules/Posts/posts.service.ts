import { Request, Response } from "express";

class PostsService {
  constructor() {}
  createPost = async (req: Request, res: Response): Promise<Response> => {
    return res.success({
      statusCode: 201,
      message: "Post created successfully",
      data: req.body,
    });
  };
}

export default new PostsService();
