import {
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";

const reactionType = new GraphQLObjectType({
  name: "reactionType",
  fields: {
    user: { type: GraphQLID },
    type: { type: GraphQLInt },
  },
});

export const postType = new GraphQLObjectType({
  name: "postType",
  fields: () => ({
    _id: { type: GraphQLID },
    content: { type: new GraphQLNonNull(GraphQLString) },
    availability: { type: GraphQLInt },
    createdBy: { type: GraphQLID },
    tags: { type: new GraphQLList(GraphQLID) },
    reactions: { type: new GraphQLList(reactionType) },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    deletedAt: { type: GraphQLString },
  }),
});

export const getAllPostsResponse = new GraphQLObjectType({
  name: "getAllPostsResponse",
  fields: {
    message: { type: new GraphQLNonNull(GraphQLString) },
    posts: { type: new GraphQLList(postType) },
  },
});
