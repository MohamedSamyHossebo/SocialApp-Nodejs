import { GraphQLObjectType, GraphQLSchema } from "graphql";
import { userGqlSchema } from "../User/gql/user.shcema.gql";
import { postGqlSchema } from "../Posts/gql/posts.shcema.gql";

const queryFields = {
  ...userGqlSchema.registerQuery(),
  ...postGqlSchema.registerQuery(),
};

const mutationFields = {
  ...userGqlSchema.registerMutation(),
};

const query = new GraphQLObjectType({
  name: "RootQueryType",
  description: "This is the root query type for the GraphQL API",
  fields: queryFields,
});

const mutation = Object.keys(mutationFields).length > 0
  ? new GraphQLObjectType({
      name: "RootMutationType",
      description: "This is the root mutation type for the GraphQL API",
      fields: mutationFields,
    })
  : undefined;

export const schema = new GraphQLSchema({
  query,
  ...(mutation ? { mutation } : {}),
});
