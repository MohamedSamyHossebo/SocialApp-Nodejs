import { postResolver, PostResolver } from "./post.reslover";
import * as postGraphQlTypes from "./posts.types.gql";

class PostGqlSchema {
  private readonly resolver: PostResolver;
  constructor() {
    this.resolver = postResolver;
  }

  registerQuery() {
    return {
      getAllPosts: {
        type: postGraphQlTypes.getAllPostsResponse,
        resolve: this.resolver.getAllPosts,
      },
    };
  }

  registerMutation() {
    return {
      // Fields
    };
  }
}

export const postGqlSchema = new PostGqlSchema();
